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
const videoConstraints = {
    width: 400,
    height: 400,
    facingMode: 'user',
};

const Queue = (props) => {
    const canvasRef = useRef();
    const [faceExpression, setFaceExpression] = useState([]);
    const [songsList, setSongsList] = useState([]);
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

    const captureFaceExpression = () => {
        if (faceExpression) {
            handleSpotifyCall(faceExpression);
        }
    };

    return (
        <>
            <Container sx={{ height: '100vh', display: 'flex' }}>
                <div style={{ flexDirection: 'row' }}>
                    <Card className="card">
                        <div>
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
                                Capture
                            </Button>
                        </div>
                    </Card>
                    {faceExpression}
                </div>
                <div>{songsList?.length > 0 && <SongsList songList={songsList} />}</div>
            </Container>
        </>
    );
};

const SongsList = ({ songList }) => {
    return (
        <div>
            <List sx={{ maxWidth: 360, bgcolor: 'background.paper' }}>
                {songList?.map((song, i) => {
                    return (
                        <ListItem alignItems="flex-start">
                            <ListItemAvatar>
                                <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
                            </ListItemAvatar>
                            <ListItemText
                                primary="Brunch this weekend?"
                                secondary={
                                    <React.Fragment>
                                        <Typography
                                            sx={{ display: 'inline' }}
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            {song?.name}
                                        </Typography>
                                        {" — I'll be in your neighborhood doing errands this…"}
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
