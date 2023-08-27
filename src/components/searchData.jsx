import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@mui/material';
import DisplayData from './DisplayData';
import { Button } from '@mui/material';
import Input from '@mui/material/Input';
import { FormControl } from '@mui/material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';


const theme = createTheme({
    palette: {
        primary: {
            light: '#99cbfd',
            main: '#4d97f8',
            dark: '#3746a2',
            contrastText: '#fff',
        },
        secondary: {
            light: '#fffbe8',
            main: '#eec94b',
            dark: '#9e7937',
            contrastText: '#000',
        },
    },
});

const ColorButton = styled(Button)(({ theme }) => ({
    color: theme.palette.secondary.light,
    backgroundColor: theme.palette.primary.main,
    '&:hover': {
        backgroundColor: theme.palette.primary.dark,
    },
}));
const StyledInput = styled(Input)(({ theme }) => ({
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1),
}));

//main search to spotify
const SearchData = ({ username, setShowSplash }) => {
    const [response, setResponse] = useState([]);
    const [audioInfo, setAudioInfo] = useState([]);
    const [userFav, setUserFav] = useState([])
    const [offset, setOffset] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialSearchQuery = searchParams.get('q') || '';
    const [inputField, setInputField] = useState('');
    //to display text for user search
    const [searchResult, setSearchResult] = useState('');
    const searchInputRef = useRef(null);

    useEffect(() => {
        if (initialSearchQuery) {
            setInputField(initialSearchQuery);
            fetchData();
            setShowSplash(false);
        }
    }, []);


    const fetchData = (newOffset = 1) => {
        const idCache = [];
        if (inputField.trim() !== '') {
            setLoading(true);
            setShowSplash(false);
            const searchQuery = encodeURIComponent(inputField);
            fetch(`http://localhost:4000/search?query=${searchQuery}&offset=${newOffset}`)
                .then(res => res.json())
                .then(data => {
                    data.tracks.items.forEach((item) => {
                        idCache.push(item.id);
                    })
                    const searchData = data.tracks.items;
                    navigate(`/?q=${searchQuery}`)
                    setResponse(prev => [...prev, ...searchData]);
                    // setSearchResult(inputField);
                    fetch(`http://localhost:4000/advancedSearch?query=${idCache.join(',')}`)
                        .then(res => res.json())
                        .then(data => {
                            const additionalData = data.audio_features
                            setAudioInfo(prev => [...prev, ...additionalData]);
                        })
                        .catch(error => {
                            console.error('Error in advanced search:', error);
                        });
                    fetch('http://localhost:4000/favs', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ username }),
                        credentials: 'include',
                    })
                        .then(res => res.json())
                        .then(res => {
                            const favArray = res.favorites.map(el => el.id);
                            const obj = {};
                            for (const el of favArray) {
                                if (!obj[el]) {
                                    obj[el] = true;
                                }
                            }
                            setUserFav(obj);
                        })
                        .catch(err => {
                            console.log(err);
                        });
                    setLoading(false);
                    //need a fetch to favorites to check if already fav and pass prop to display    
                    setOffset(newOffset);
                })
                .catch(error => {
                    setLoading(false);
                    console.error('Error:', error);
                });
        }
    };



    const handleFormSubmit = (event) => {
        event.preventDefault();
        // const searchValue = searchInputRef.current.value;
        // setInputField(searchValue)
        setResponse([]);
        setAudioInfo([]);
        fetchData();
    };
    const handleInputChange = (event) => {
        setInputField(event.target.value);
    };
    const handleLoadMore = () => {
        const nextOffset = offset + 25;
        fetchData(nextOffset);
    }



    return (
        <ThemeProvider theme={theme}>
            <div>
                {!loading ? (
                    <div className='searchform-container'>
                        <form className='searchform' onSubmit={handleFormSubmit}>
                            <FormControl>
                                <StyledInput
                                    className='searchbox'
                                    placeholder='find songs'
                                    type='text'
                                    // inputRef = {searchInputRef}
                                    value={inputField}
                                    onChange={handleInputChange}
                                />
                            </FormControl>
                            <ColorButton type='submit' variant='outlined'>
                                Search
                            </ColorButton>
                        </form>
                    </div>
                ) : null}
                {loading ? (
                    <p>Plugging Results</p>
                ) : (
                    <DisplayData data={response} audioData={audioInfo} userFav={userFav} username={username} theme={theme} onLoadMore={handleLoadMore} searchResult={searchResult} />
                )}
            </div>
        </ThemeProvider>
    );
}


export default SearchData;
