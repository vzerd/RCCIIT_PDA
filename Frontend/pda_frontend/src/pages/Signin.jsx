import {
    Backdrop,
    Box,
    Button,
    CircularProgress,
    Snackbar,
    TextField,
    Typography
} from "@mui/material";
import {useEffect, useState} from "react";
import Cookies from 'js-cookie';
import {useNavigate} from 'react-router-dom';
import axios from "axios";
import LoginIcon from '@mui/icons-material/Login';

function Signin() {

    const navigate = useNavigate();
    const [signinError, setSigninError] = useState(false);
    const [signinErrorMessage, setSigninErrorMessage] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [openBackdrop, setOpenBackdrop] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [tokenValue, setTokenValue] = useState("");
    const [nameValue, setNameValue] = useState("");
    const [signinState, setSigninState] = useState(false);

    function validate(username, password){
        if(username === "" && password === ""){
            setSigninErrorMessage("Fields are empty!");
            setSigninError(true);
            return false;
        }else if(username === ""){
            setSigninErrorMessage("Please enter the user name.");
            setSigninError(true);
            return false;
        }else if(password === ""){
            setSigninErrorMessage("Please enter the password.");
            setSigninError(true);
            return false;
        }
        return true;
    }

    function handleSignin() {
        if(validate(username, password)){
            setSigninErrorMessage("");
            setSigninError(false);
            setOpenBackdrop(true);
            axios.post('http://ec2-13-232-61-89.ap-south-1.compute.amazonaws.com:8097/api/v1/auth/sign_in', {
                password: password,
                name: username
            })
                .then(function (response) {
                    setTokenValue(response.data.token);
                    setNameValue(response.data.username);
                    setOpenBackdrop(false);
                    setSigninState(true);
                    setSnackbarMessage("Sign In Successful!");
                    setOpenSnackbar(true);
                })
                .catch((error) => {
                    if (error.response) {
                        if (error.response.status === 406) {
                            setSigninErrorMessage("Invalid credentials. Please try again.");
                            setSigninError(true);
                        } else if (error.response.status === 404) {
                            setSigninErrorMessage("User not found! Please try again.");
                            setSigninError(true);
                        } else if (error.response.status === 500) {
                            setSnackbarMessage("Server error. Please try again later.");
                            setOpenSnackbar(true);
                        }
                    } else {
                        setSnackbarMessage("Network error. Please check your connection.");
                        setOpenSnackbar(true);
                    }
                    setOpenBackdrop(false);
                })
        }
    }

    function handleSnackbarClose() {
        if(signinState){
            Cookies.set('token', tokenValue, { expires: 1 });
            Cookies.set('name', nameValue, { expires: 1 });
        }
        setOpenSnackbar(false);
    }

    function handleAboutusButton(){
        navigate('/AboutUs');
    }

    useEffect(() => {
        if(Cookies.get('token') !== undefined){
          navigate('/Home');
        }
    });

    return (
        <>
            <Box sx={{
                    display: 'flex',
                    width: '100vw',
                    height: '92vh',
            }}>
                {(<Backdrop
                    sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                    open={openBackdrop}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>)}
                <Box sx={{ width: '60vw',
                        height: '92vh',
                        display: 'flex',
                        justifyContent: 'flex-start',
                        backgroundColor: '#4A628A'
                }}>
                    <Box
                        sx={{ height: '92vh',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        backgroundColor: '#4A628A'
                    }}>
                        <Typography sx={{
                            fontSize: '8em',
                            fontWeight: 100,
                            color: '#ffffff',
                            marginTop: '15vh',
                            marginLeft: '5vw'
                            }}>
                            RCCIIT
                        </Typography>
                        <Typography sx={{
                            fontSize: '3em',
                            fontWeight: 400,
                            color: '#ffffff',
                            marginLeft: '5.5vw',
                            }}>
                            <span style={{ fontWeight: 'bold' }}>P</span>lacement
                        </Typography>
                        <Typography sx={{
                            fontSize: '3em',
                            fontWeight: 400,
                            color: '#ffffff',
                            marginLeft: '5.5vw'
                            }}>
                            <span style={{ fontWeight: 'bold' }}>D</span>ata
                        </Typography>
                        <Typography sx={{
                            fontSize: '3em',
                            fontWeight: 400,
                            color: '#ffffff',
                            marginLeft: '5.5vw'
                            }}>
                            <span style={{ fontWeight: 'bold' }}>A</span>nalytics
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ width: '40vw',
                    height: '92vh',
                    backgroundColor: '#B9E5E8'
                }}>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        marginTop: '28vh',
                        marginLeft: '12vw',
                        marginBottom: '1vw',
                        alignItems: 'center'
                    }}>
                        <Typography sx={{
                            fontSize: '2.5em',
                            fontWeight: 900,
                            color: '#4A628A',
                        }}>
                            Sign In
                        </Typography>
                        <LoginIcon fontSize="large" sx={{
                            paddingLeft: '0.5vw',
                            color: '#4A628A',
                        }}/>
                    </Box>
                    {signinError && (<Typography sx={{
                        fontSize: '1em',
                        marginLeft: '12vw',
                        fontWeight: 400,
                        color: '#ffffff',
                        backgroundColor: '#d40000',
                        width: '38%',
                        padding: '1%'
                    }}>
                        {signinErrorMessage}
                    </Typography>)}
                    <TextField
                        id="user-name"
                        label="USER NAME"
                        variant="standard"
                        type="text"
                        color='#0d0047'
                        sx={{
                            marginTop: '1vh',
                            marginLeft: '12vw',
                            width: '40%',
                            backgroundColor: '#f2f8ff',
                            input: {
                                color: 'black',
                                fontSize: '20px',
                                fontWeight: 'bold'
                            }
                        }}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        id="password"
                        label="PASSWORD"
                        variant="standard"
                        type="password"
                        color='#0d0047'
                        sx={{
                            marginTop: '2vh',
                            marginLeft: '12vw',
                            width: '40%',
                            backgroundColor: '#f2f8ff',
                            input: {
                                color: 'black',
                                letterSpacing: '3px',
                                fontSize: '20px',
                                WebkitTextSecurity: 'disc',
                                MozTextSecurity: 'disc',
                                textSecurity: 'disc'
                            }
                        }}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        variant="contained"
                        onClick={handleSignin}
                        sx={{
                            marginTop: '3vh',
                            marginLeft: '24vw',
                            backgroundColor: '#4A628A',
                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)',
                            '&:hover': {
                                backgroundColor: '#7AB2D3',
                            }
                        }}>
                        <LoginIcon/>
                    </Button>
                    <Snackbar
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        open={openSnackbar}
                        onClose={handleSnackbarClose}
                        autoHideDuration={2000}
                        message={snackbarMessage}
                    />
                </Box>
            </Box>
            <Box sx={{
                display: 'flex',
                flexDirection: 'row',
                width: '100vw',
                height: '8vh',
                backgroundColor: '#7AB2D3',
                alignItems: 'center'
            }}>
                <Typography sx={{
                    fontSize: '0.8em',
                    fontWeight: '900',
                    marginLeft: '3vw'
                }}>
                    {'Copyright © RCCIIT PDA Team '}
                    {new Date().getFullYear()}
                    {'.'}
                </Typography>
                <Box sx={{
                    display: 'flex',
                    flexGrow: 1,
                    justifyContent: 'flex-end'
                }}>
                    <Button
                        onClick={handleAboutusButton}
                        sx={{
                            marginRight: '3vw',
                            color: '#ffffff',
                            backgroundColor: '#7AB2D3',
                            fontWeight: '900'
                        }}
                    >
                        About Us
                    </Button>
                </Box>
            </Box>
        </>
    );
}

export default Signin;