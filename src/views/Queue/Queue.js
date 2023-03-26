import React, { useRef, useEffect, useState } from 'react';
import {
    Typography,
    Container,
    Card,
    Button,
    ListItemButton,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
} from '@mui/material';
import * as faceapi from 'face-api.js';
import SpotifyWebApi from 'spotify-web-api-js';
import ReactJkMusicPlayer from 'react-jinke-music-player';
import 'react-jinke-music-player/assets/index.css';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import './style.css';

const ACCESS_TOKEN =
    'BQB12uul5nkrqGjkFB9_6fF9Q2h_DOVF4V2UVAtV3Ighz1ype_R60U4cwKVtGKlI5cJYp7xF-HlZZEuJCxfFtpIMKQ6RB0ds3kwEzRq5mQV74UfcGG8PhHUojvkkVA-IF3dgsnrmdhXiUDS7TVyqMxBYYWxNYAARgbjIg4fFM81aG2QmIROXT8x4EbOlA8NS4ZibXsfV9DTKGSFs1Sw61uHQ';

const Queue = () => {
    const [faceExpression, setFaceExpression] = useState([]);
    const [songsList, setSongsList] = useState([]);
    const [playingIndex, setPlayingIndex] = useState(null);

    const webcamRef = useRef();
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
            const detections = await faceapi
                .detectAllFaces(webcamRef.current, new faceapi.TinyFaceDetectorOptions())
                .withFaceExpressions()
                .withAgeAndGender();
            showFaceDetectionData(detections);
        }, 1000);
    };

    const handleSpotifyCall = (expression) => {
        const spotifyAPI = new SpotifyWebApi();
        spotifyAPI.setAccessToken(ACCESS_TOKEN);
        let prev = null;

        prev = spotifyAPI.searchTracks(expression);
        prev.then(
            function (data) {
                prev = null;
                const updatedList = data?.tracks?.items?.map((song) => {
                    return {
                        name: song?.name,
                        musicSrc: song?.preview_url,
                        cover: song?.album?.images?.[2]?.url,
                        singer: song?.artists[0]?.name,
                        ...song,
                    };
                });
                setSongsList(updatedList);
            },
            function (err) {
                console.error(err);
            },
        );
    };

    const playSong = (id) => {
        const index = songsList?.findIndex((song) => song?.id === id);
        setPlayingIndex(index);
    };

    const captureFaceExpression = () => {
        if (faceExpression) {
            handleSpotifyCall(faceExpression);
        }
    };

    const handlePlayingIndex = (index) => {
        setPlayingIndex(index);
    };

    const getColor = (face) => {
        if (face === 'happy') {
            return 'green';
        } else if (face === 'sad') {
            return 'yellow';
        } else if (face === 'angry') {
            return 'red';
        } else if (face === 'fearful') {
            return 'orange';
        } else if (face === 'surprised') {
            return 'blue';
        } else {
            return 'white';
        }
    };

    return (
        <div>
            <Container sx={{ height: '100vh', display: 'flex' }}>
                <div>
                    <Card
                        style={{
                            width: 400,
                            height: 100,
                            marginTop: 20,
                            padding: 10,
                            backgroundColor: getColor(faceExpression),
                        }}
                    >
                        <h3>Your current mood</h3>
                        <h2>{faceExpression}</h2>
                    </Card>
                    <Card className="card">
                        <div>
                            <video
                                autoPlay
                                crossOrigin="anonymous"
                                audio={false}
                                height={420}
                                ref={webcamRef}
                                width={400}
                            ></video>
                        </div>
                        <div>
                            <Button
                                variant="contained"
                                onClick={(e) => {
                                    captureFaceExpression();
                                }}
                                className="btn btn-danger button"
                            >
                                Capture Your Mood
                            </Button>
                        </div>
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
                    <h2>Music according to your current mood </h2>
                    <div>
                        {songsList?.length > 0 && playingIndex !== null && (
                            <ReactJkMusicPlayer
                                audioLists={songsList}
                                mode={'full'}
                                playIndex={playingIndex}
                                onPlayIndexChange={handlePlayingIndex}
                                clearPriorAudioLists
                            />
                        )}
                    </div>
                    <div>
                        {songsList?.length > 0 && (
                            <SongsList songList={songsList} playSong={playSong} playingIndex={playingIndex} />
                        )}
                    </div>
                </Card>
            </Container>
        </div>
    );
};

const SongsList = ({ songList, playSong = () => {}, playingIndex }) => {
    return (
        <div style={{ overflowY: 'scroll', maxHeight: 550 }}>
            <List sx={{ bgcolor: 'background.paper', alignContent: 'center' }}>
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
                            <ListItemButton selected={playingIndex === i}>
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
                                <PlayCircleIcon sx={{ width: 60, height: 60, color: '#aaa' }} />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </div>
    );
};

export default Queue;
