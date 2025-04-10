import axios from "axios";
import React, { useEffect, useState } from "react";
import "./Player.css";
import { useLocation } from "react-router-dom";

import Queue from "../components/queue/Queue";
import AudioPlayer from "../components/audioPlayer/AudioPlayer";
import Widgets from "../components/widgets/Widgets";
import config from "../config";




export default function Player() {
  const location = useLocation();
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [getAllSongs, setGetAllSongs] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);


  useEffect(() => {
    const getAllSongs = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${config.lyric}/api/songs`);
        setGetAllSongs(data.data);
        console.log(data.data);
      } catch (error) {
        setError('Failed to fetch songs');
      } finally {
        setLoading(false);
      }
    };
    getAllSongs();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (location.state && location.state.source === "spotify") {
        const token = location.state.accessToken;
        if (token) {
          try {
            const response = await axios.get(
              `https://api.spotify.com/v1/playlists/${location.state.id}/tracks`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            setTracks(response.data.items);
            console.log("songs:",response.data.items);
            setCurrentTrack(response.data.items[0]?.track);
            console.log("url:",response.data.items[0]?.track)
          } catch (error) {
            console.error("Error fetching playlist tracks:", error);
          }
        } else {
          console.error("Access token not found.");
        }
      }
    };

    fetchData();
  }, [location.state]);

  useEffect(() => {
    const fetchSamaaSongData = async () => {
      if (location.state && location.state.songId) {
        const songId = location.state.songId;
        const songIndex = getAllSongs.findIndex(song => song._id === songId);
        if (songIndex !== -1) {
          setTracks(getAllSongs);
          setCurrentTrack(getAllSongs[songIndex]);
          setCurrentIndex(songIndex);
          console.log("Song Image:", getAllSongs[songIndex].img)
        }
      }
    };
    fetchSamaaSongData();
  }, [location.state, getAllSongs]);

  useEffect(() => {
    if (tracks && tracks.length > 0 && currentIndex >= 0 && currentIndex < tracks.length) {
      const currentTrackData = tracks[currentIndex];
      const isSpotifyTrack = currentTrackData.hasOwnProperty('track');
      setCurrentTrack(isSpotifyTrack ? currentTrackData.track : currentTrackData.song);
    }
  }, [currentIndex, tracks]);
  

useEffect(() => {
  const fetchSammaPlaylist = async () => {
    if (location.state && location.state.source === "samma") {
      const token = localStorage.getItem("userAuthToken");
      if (token) {
        try {
          const response = await axios.get(
            `${config.lyric}/api/playlists/${location.state.id}`,
            {
              headers: {
                "x-auth-token": token,
              },
            }
          );
          if (response.data.data.songs) {
            const sammaTracks = response.data.data.songs
            setTracks(sammaTracks);
            console.log("songs array:",sammaTracks)
            setCurrentTrack(sammaTracks[0]);
            console.log("current song:",sammaTracks[0])
            console.log("current song image:",sammaTracks[0].img )
            console.log("current song url:",sammaTracks[0].song )
          } else {
            console.error("Error: No playlist data found.");
          }
        } catch (error) {
          console.error("Error fetching Samma playlist tracks:", error);
        }
      } else {
        console.error("User authentication token not found.");
      }
    }
  };

  fetchSammaPlaylist();
}, [location.state]); 







useEffect(() => {
  const fetchSaavnPlaylist = async () => {
    if (location.state && location.state.source === "saavn") {
      try {
        setLoading(true);
        const response = await axios.get(`https://saavn.dev/api/playlists`, {
          params: {
            id: location.state.id,
          },
        });
        if (response.data.success) {
          const saavnPlaylist = response.data.data;
          setTracks(saavnPlaylist.songs);
          setCurrentTrack(saavnPlaylist.songs[0]);
          console.log("Saavn playlist songs:", saavnPlaylist.songs);
        } else {
          setError("Failed to fetch Saavn playlist.");
        }
      } catch (error) {
        setError("Error fetching Saavn playlist: " + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  fetchSaavnPlaylist();
}, [location.state]);

  return (
    <div className="screen-container flex">
      <div className="left-player-body">
        <AudioPlayer
          currentTrack={currentTrack}
          total={tracks}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
        />
        <Widgets/>
      </div>
      <div className="right-player-body">
      
        <Queue tracks={tracks} setCurrentIndex={setCurrentIndex} />

      </div>
    </div>
  );
}
