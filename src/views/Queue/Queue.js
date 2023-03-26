import React, { useRef, useEffect, useState } from 'react';
import { Typography, Container, Card, Button } from '@mui/material';
import * as faceapi from 'face-api.js';
import SpotifyWebApi from 'spotify-web-api-js';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';

import './style.css';
import { Label } from '@mui/icons-material';
const videoConstraints = {
    width: 400,
    height: 400,
    facingMode: 'user',
};

const Queue = (props) => {
    const canvasRef = useRef();
    const [faceExpression, setFaceExpression] = useState([]);
    const [songsList, setSongsList] = useState([]);
    const [audio, setAudio] = useState(null);
    const [audioId, setAudioId] = useState(null);

    const [playing, setPlaying] = useState(false);

    const toggle = () => setPlaying(!playing);

    useEffect(() => {
        playing ? audio?.play() : audio?.pause();
    }, [playing]);
    // const [faceDrawing, setFaceDrawing] = useState([]);
    const webcamRef = useRef();
    // const picturRef = useRef();
    let intervalId = null;
    let faceDrawings = [];
    useEffect(() => {
        startVideo();
        webcamRef && loadModels();
    }, []);

    const loadModels = () => {
        Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
            faceapi.nets.faceExpressionNet.loadFromUri('/models'),
            faceapi.nets.ageGenderNet.loadFromUri('/models'),
        ]).then(() => {
            faceDetection();
        });
    };

    const startVideo = () => {
        navigator.mediaDevices
            .getUserMedia({ video: true })
            .then((currentStream) => {
                webcamRef.current.srcObject = currentStream;
            })
            .catch((err) => {
                console.error(err);
            });
    };

    function showFaceDetectionData(data) {
        faceDrawings = data;
        if (data?.length) {
            const expression = Object.keys(data[0]?.expressions).reduce((a, b) =>
                data[0]?.expressions[a] > data[0]?.expressions[b] ? a : b,
            );
            setFaceExpression(expression);
        }
    }

    const faceDetection = async () => {
        intervalId = setInterval(async () => {
            const canvas = faceapi.createCanvas(webcamRef.current);

            const detections = await faceapi
                .detectAllFaces(webcamRef.current, new faceapi.TinyFaceDetectorOptions())
                .withFaceExpressions()
                .withAgeAndGender();
            // if (detections?.length > 0) {
            showFaceDetectionData(detections);
            // }
        }, 1000);
    };

    const handleSpotifyCall = (expression) => {
        const spotifyAPI = new SpotifyWebApi();
        spotifyAPI.setAccessToken(
            'BQA3fJSgaKKuXv0nC92vZ3s5qFYS-NwUC-QWD2hrLQAxJzqAWi--EDf4bgbA12d_Zl3O_3GI8QophxDfyEp1VPs_3SwP6rbzBQOFy0V4WQg6eEjB6KKSTbv--iMd1lNCNWlSHYNMuVTmxS9R_Gc3AJtS52XOXpriHJ1HoBWEgdiKRyW0SFK2FXXozk9U9XAuzQc2NGqn7Qj_GY5AdmbVuPJx',
        );
        // spotifyAPI.setPromiseImplementation(Q);
        let prev = null;

        prev = spotifyAPI.searchTracks('expression');
        prev.then(
            function (data) {
                // clean the promise so it doesn't call abort
                prev = null;
                setSongsList(data?.tracks?.items);
                // ...render list of search results...
            },
            function (err) {
                console.error(err);
            },
        );
    };

    const playSong = (id) => {
        console.log(id);
        const songURL = songsList?.find((song) => song?.id === id);
        setAudioId(id);
        toggle();
        setAudio(null);
        setAudio(new Audio(songURL?.preview_url));
        
    };

    const captureFaceExpression = () => {
        if (faceExpression) {
            handleSpotifyCall(faceExpression);
        }
    };

    return (
        <>
            <Container sx={{ height: '100vh', display: 'flex' }}>
                <div>
                    <Card className="card">
                        <div>
                            <div>
                                <p>Are you happy, sad or neutral?</p>
                            </div>
                            <video
                                autoPlay
                                crossOrigin="anonymous"
                                audio={false}
                                height={400}
                                ref={webcamRef}
                                width={400}
                            ></video>
                            {/* <canvas ref={canvasRef} width="240" height="250" /> */}
                        </div>
                        <div>
                            <Button
                                variant="contained"
                                onClick={(e) => {
                                    // e.preventDefault();
                                    captureFaceExpression();
                                }}
                                className="btn btn-danger button"
                            >
                                Capture Your Mood
                            </Button>
                        </div>
                    </Card>
                    <Card
                        style={{
                            width: 400,
                            height: 100,
                            marginTop: 20,
                            padding: 10,
                        }}
                    >
                        <h3>Your current Expression :</h3>
                        <h2> {faceExpression}</h2>
                    </Card>
                </div>
                <Card
                    style={{
                        alignItems: 'center',
                        width: 800,
                        height: 620,
                        marginTop: 20,
                        marginLeft: 20,
                        padding: 10,
                        justifyContent: 'center',
                    }}
                >
                    <h2>Songs According to you current expression: </h2>
                    <div>{songsList?.length > 0 && <SongsList songList={songsList} playSong={playSong} />}</div>
                </Card>
            </Container>
        </>
    );
};

const SongsList = ({ songList, playSong = () => {} }) => {
    return (
        <div style={{ overflowY: 'scroll', maxHeight: 550 }}>
            <List sx={{ maxWidth: 360, bgcolor: 'background.paper' }}>
                {songList?.map((song, i) => {
                    let second = song?.duration_ms / 1000;
                    let min = second / 60;
                    return (
                        <ListItem
                            alignItems="flex-start"
                            onClick={() => {
                                playSong(song?.id);
                            }}
                        >
                            <ListItemAvatar>
                                <img src={song?.album?.images?.[2]?.url} />
                            </ListItemAvatar>
                            <ListItemText
                                style={{ marginLeft: 10, fontWeight: 'bold', cursor: 'pointer' }}
                                primary={song?.album?.name}
                                secondary={
                                    <React.Fragment>
                                        <Typography
                                            sx={{ display: 'inline' }}
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            {song?.album?.artists?.[0]?.name}
                                        </Typography>
                                        <Typography>{`${min?.toFixed(2)} min`}</Typography>
                                    </React.Fragment>
                                }
                            />
                        </ListItem>
                    );
                })}
            </List>
        </div>
    );
};

export default Queue;
