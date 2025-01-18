import {Box, Button, Typography} from "@mui/material";
import {useNavigate} from "react-router-dom";

function Aboutus(){

    const navigate = useNavigate();
    function handleHomeButton(){
        navigate('/Home');
    }

    return (
        <>
            <Box sx={{
                width: '100vw',
                height: '100vh',
                backgroundColor: '#4A628A'
            }}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '100vw',
                    height: '15vh',
                    backgroundColor: '#4A628A'
                }}>
                    <Typography sx={{
                        fontSize: '3em',
                        marginLeft: '3vw',
                        fontWeight: 100,
                        color: '#DFF2EB',
                    }}>
                        RCCIIT
                    </Typography>
                    <Typography sx={{
                        fontSize: '3em',
                        marginLeft: '1vw',
                        color: '#DFF2EB',
                    }}>
                        PDA
                    </Typography>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        width: '100vw',
                        height: '14vh',
                        backgroundColor: '#4A628A'
                    }}>
                        <Button
                            onClick={handleHomeButton}
                            sx={{
                                marginRight: '3vw',
                                color: '#ffffff',
                                backgroundColor: '#4A628A',
                                fontWeight: '900'
                            }}
                        >
                            Back
                        </Button>
                    </Box>
                </Box>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                    width: '100vw',
                    height: '65vh',
                    backgroundColor: '#4A628A'
                }}>
                    <Box sx={{
                        width: '18vw',
                        height: '40vh',
                        borderRadius: '10px',
                        backgroundColor: '#FFFFFF'
                    }}>

                    </Box>
                    <Box sx={{
                        width: '18vw',
                        height: '40vh',
                        borderRadius: '10px',
                        backgroundColor: '#FFFFFF'
                    }}>

                    </Box>
                    <Box sx={{
                        width: '18vw',
                        height: '40vh',
                        borderRadius: '10px',
                        backgroundColor: '#FFFFFF'
                    }}>

                    </Box>
                    <Box sx={{
                        width: '18vw',
                        height: '40vh',
                        borderRadius: '10px',
                        backgroundColor: '#FFFFFF'
                    }}>

                    </Box>
                </Box>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    width: '100vw',
                    height: '20vh',
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
                </Box>
            </Box>
        </>
    );
}
export default Aboutus;