import {Backdrop, Box, Button, CircularProgress, Snackbar, Tooltip, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import Cookies from "js-cookie";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import LogoutIcon from '@mui/icons-material/Logout';
import * as XLSX from "xlsx";
import FemaleIcon from '@mui/icons-material/Female';
import MaleIcon from '@mui/icons-material/Male';
import { PieChart } from '@mui/x-charts/PieChart';
import {axisClasses, BarChart} from "@mui/x-charts";

function Home() {

    const navigate = useNavigate();
    const [fileName, setFileName] = useState("NO FILE SELECTED.")
    const [username, setUsername] = useState("");
    const [signoutState, setSignoutState] = useState(false);
    const [openBackdrop, setOpenBackdrop] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [selectButtonText, setSelectButtonText] = useState("Select");
    const [fileSize, setFileSize] = useState("0 byte");
    const [numberOfRows, setNumberOfRows] = useState("-");
    const [numberOfColumns, setNumberOfColumns] = useState("-");
    const [selectDisabled, setSelectDisabled] = useState(false);
    const [uploadDisabled, setUploadDisabled] = useState(true);
    const [analyzeDisabled, setAnalyzeDisabled] = useState(true);
    const [downloadDisabled, setDownloadDisabled] = useState(true);
    const [uploadError, setUploadError] = useState(false);
    const [uploadErrorMessage, setUploadErrorMessage] = useState("");
    const [selectFile, setSelectFile] = useState(null);
    const [analyzedFile, setAnalyzedFile] = useState(null);
    const [placeableCount, setPlaceableCount] = useState("-");
    const [placeablePercentage, setPlaceablePercentage] = useState("-");
    const [placeableColor, setPlaceableColor] = useState("");
    const [femaleCount, setFemaleCount] = useState("-");
    const [femalePercentage, setFemalePercentage] = useState("-");
    const [maleCount, setMaleCount] = useState("-");
    const [malePercentage, setMalePercentage] = useState("-");
    const [CSECounts, setCSECounts] = useState({ MALE: 0, FEMALE: 0 });
    const [ITCounts, setITCounts] = useState({ MALE: 0, FEMALE: 0 });
    const [ECECounts, setECECounts] = useState({ MALE: 0, FEMALE: 0 });
    const [EECounts, setEECounts] = useState({ MALE: 0, FEMALE: 0 });
    const [AEIECounts, setAEIECounts] = useState({ MALE: 0, FEMALE: 0 });

    function resetToDefault() {
        setSelectDisabled(false);
        setAnalyzeDisabled(true);
        setDownloadDisabled(true);
        setNumberOfRows("-");
        setNumberOfColumns("-");
        setFileSize("0 byte");
        setPlaceablePercentage("-");
        setPlaceableColor("");
        setPlaceableCount("-");
        setAnalyzedFile(null);
        setFemaleCount("-");
        setFemalePercentage("-");
        setMaleCount("-");
        setMalePercentage("-");
        setAnalyzedFile(null);
        setCSECounts({ MALE: 0, FEMALE: 0 });
        setITCounts({ MALE: 0, FEMALE: 0 });
        setECECounts({ MALE: 0, FEMALE: 0 });
        setEECounts({ MALE: 0, FEMALE: 0 });
        setAEIECounts({ MALE: 0, FEMALE: 0 });
    }

    function handleSignout(){
        setOpenBackdrop(true);
        axios.post('http://ec2-13-232-61-89.ap-south-1.compute.amazonaws.com:8097/api/v1/auth/sign_out', {
            token: Cookies.get("token")
            })
            .then(function (response) {
                if(response.status === 200){
                    setSignoutState(true);
                    setSnackbarMessage("Sign Out Successful!");
                    setOpenSnackbar(true);
                }
            })
            .catch((error) => {
                if (error.response) {
                     if (error.response.status === 404){
                         setSignoutState(true);
                         setSnackbarMessage("Session Expired!");
                         setOpenSnackbar(true);
                     } else if (error.response.status === 500){
                         setSnackbarMessage("Server error. Please try again later.");
                         setOpenSnackbar(true);
                     }
                }else{
                    setSnackbarMessage("Network error. Please check your connection.");
                    setOpenSnackbar(true);
                }
                setOpenBackdrop(false);
            });
    }

    function handleSelectButton(event){
        const file = event.target.files[0];
        if(file){
            resetToDefault();
            setSelectFile(file);
            setFileName(file.name);
            setSelectButtonText("re-Select");
            setFileSize(file.size + " bytes");
            getRowColumnCount(file);
            setUploadDisabled(false);
        }else{
            setFileName("NO FILE SELECTED.");
        }
    }

    function handleUploadButton(){
        setDownloadDisabled(true);
        setSelectDisabled(true);
        setOpenBackdrop(true);
        const formData = new FormData();
        formData.append("file", selectFile);
        formData.append("token", Cookies.get("token"));
        axios.post('http://ec2-13-232-61-89.ap-south-1.compute.amazonaws.com:8097/api/v1/file/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
            .then(function (response) {
                if(response.status === 200){
                    setOpenBackdrop(false);
                    setSnackbarMessage("Upload Successful!");
                    setOpenSnackbar(true);
                    setAnalyzeDisabled(false)
                    setUploadDisabled(true);
                }
            })
            .catch((error) => {
                if (error.response) {
                    if (error.response.status === 400 || error.response.status === 406){
                        setUploadErrorMessage("Incompatible request.");
                        setUploadError(true);
                    } else if (error.response.status === 404){
                        setSignoutState(true);
                        setSnackbarMessage("Session Expired!");
                        setOpenSnackbar(true);
                    } else if (error.response.status === 500){
                        setSnackbarMessage("Server error. Please try again later.");
                        setOpenSnackbar(true);
                    }
                }else{
                    setSnackbarMessage("Network error. Please check your connection.");
                    setOpenSnackbar(true);
                }
                setOpenBackdrop(false);
            });
    }

    function handleAnalyzeButton(){
        setOpenBackdrop(true);
        setAnalyzeDisabled(true);
        axios.get('http://ec2-13-232-61-89.ap-south-1.compute.amazonaws.com:8097/api/v1/file/get_analysis', {
                params: { token: Cookies.get('token') },
                responseType: 'blob',
            })
            .then((response) => {
                if(response.status === 200) {
                    const blob = new Blob([response.data], {
                        type: 'application/octet-stream',
                    });
                    getPlaceableRowCount(blob);
                    getPlaceableGenderCount(blob);
                    getStreamGenderCounts(blob)
                    setAnalyzedFile(blob);
                    setOpenBackdrop(false);
                    setSnackbarMessage("Analysis complete!");
                    setOpenSnackbar(true);
                    setDownloadDisabled(false);
                    setSelectDisabled(false);
                }
            })
            .catch((error) => {
                if (error.response) {
                    if (error.response.status === 404 || error.response.status === 406){
                        setSignoutState(true);
                        setSnackbarMessage("Session Expired!");
                        setOpenSnackbar(true);
                    } else if (error.response.status === 500){
                        setSnackbarMessage("Server error. Please try again later.");
                        setOpenSnackbar(true);
                    }
                }else{
                    setSnackbarMessage("Network error. Please check your connection.");
                    setOpenSnackbar(true);
                }
                setOpenBackdrop(false);
            });
    }

    function getRowColumnCount(file){
        const reader = new FileReader();
        reader.onload = async (e) => {
            const arrayBuffer = e.target.result;
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            const numberOfRows = jsonData.length > 1 ? jsonData.length-1 : 0;
            const numberOfColumns = jsonData[0]?.length || 0;
            setNumberOfRows(numberOfRows.toString());
            setNumberOfColumns(numberOfColumns);
        };
        reader.readAsArrayBuffer(file);
    }

    function getPlaceableRowCount(file){
        const reader = new FileReader();
        reader.onload = async (e) => {
            const arrayBuffer = e.target.result;
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            const headerRow = jsonData[0];
            const placeabilityIndex = headerRow.indexOf('Placeability');

            if (placeabilityIndex === -1) {
                setSnackbarMessage("Error: 'Placeability' column was not found!");
                setOpenSnackbar(true);
                return;
            }

            const placeableCount = jsonData.slice(1).reduce((count, row) => {
                return row[placeabilityIndex] === 'Placeable' ? count + 1 : count;
            }, 0);

            setPlaceableCount(placeableCount);
            setPlaceablePercentage((Math.round((placeableCount / numberOfRows) * 100)).toString());
        };
        reader.readAsArrayBuffer(file);
    }

    function getPlaceableGenderCount(file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const arrayBuffer = e.target.result;
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            const headerRow = jsonData[0];
            const placeabilityIndex = headerRow.indexOf('Placeability');
            const genderIndex = headerRow.indexOf('Gender');

            if (placeabilityIndex === -1) {
                setSnackbarMessage("Error: 'Placeability' column was not found!");
                setOpenSnackbar(true);
                return;
            }
            if (genderIndex === -1) {
                setSnackbarMessage("Error: 'Gender' column was not found!");
                setOpenSnackbar(true);
                return;
            }

            let femaleCount = 0;
            let maleCount = 0;

            jsonData.slice(1).forEach((row) => {
                if (row[placeabilityIndex] === 'Placeable') {
                    if (row[genderIndex] === 'FEMALE') {
                        femaleCount++;
                    } else if (row[genderIndex] === 'MALE') {
                        maleCount++;
                    }
                }
            });
            setFemaleCount(femaleCount.toString());
            setMaleCount(maleCount.toString());
            setFemalePercentage(Math.round((femaleCount/numberOfRows) * 100).toString());
            setMalePercentage(Math.round((maleCount/numberOfRows) * 100).toString());
        };
        reader.readAsArrayBuffer(file);
    }

    function getPlaceableColor(){
        if(placeablePercentage === "-"){
            setPlaceableColor('#b8cdcf');
        } else if(placeablePercentage <= 33){
            setPlaceableColor('#ff2929');
        } else if(placeablePercentage <= 66){
            setPlaceableColor('#edcf26');
        } else{
            setPlaceableColor('#26ed44');
        }
    }

    function handleSnackbarClose(){
        if(signoutState){
            Cookies.remove("token");
            Cookies.remove("name");
        }
        setOpenSnackbar(false);
    }

    function handleDownloadButton(){
        if(analyzedFile){
            const link = document.createElement('a');
            link.href = URL.createObjectURL(analyzedFile);
            link.download = 'Analytics.xlsx';
            link.click();
        }
    }

    function getStreamGenderCounts(file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const arrayBuffer = e.target.result;
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            const headerRow = jsonData[0];
            const streamIndex = headerRow.indexOf('Stream');
            const genderIndex = headerRow.indexOf('Gender');
            const placeabilityIndex = headerRow.indexOf('Placeability');

            if (streamIndex === -1 || genderIndex === -1 || placeabilityIndex === -1) {
                setSnackbarMessage("Error: 'Stream', 'Gender', or 'Placeability' column was not found!");
                setOpenSnackbar(true);
                return;
            }

            const streamGenderCounts = {
                CSE: { MALE: 0, FEMALE: 0 },
                IT: { MALE: 0, FEMALE: 0 },
                ECE: { MALE: 0, FEMALE: 0 },
                EE: { MALE: 0, FEMALE: 0 },
                AEIE: { MALE: 0, FEMALE: 0 }
            };

            jsonData.slice(1).forEach(row => {
                const placeability = row[placeabilityIndex];
                if (placeability !== 'Placeable') return;

                const stream = row[streamIndex];
                const gender = row[genderIndex];

                if (streamGenderCounts[stream] && streamGenderCounts[stream][gender] !== undefined) {
                    streamGenderCounts[stream][gender]++;
                }
            });
            setCSECounts(streamGenderCounts.CSE);
            setITCounts(streamGenderCounts.IT);
            setECECounts(streamGenderCounts.ECE);
            setEECounts(streamGenderCounts.EE);
            setAEIECounts(streamGenderCounts.AEIE);
        };
        reader.readAsArrayBuffer(file);
    }

    function handleAboutusButton(){
        navigate('/AboutUs');
    }

    const chartSetting = {
        yAxis: [
            {
                label: 'Placeable Students Count'
            }
        ],
        sx: {
            [`.${axisClasses.left} .${axisClasses.label}`]: {
                transform: 'translate(-20px, 0)',
            },
        },
    };

    useEffect(() => {
        if(Cookies.get('token') === undefined){
            navigate('/');
        }
    });

    useEffect(() =>{
        setUsername(Cookies.get('name'));
    }, []);

    useEffect(() =>{
        getPlaceableColor();
    }, [placeablePercentage]);

    return (
        <>
            <Box sx={{
                width: '100vw',
                height: '100vh',
                backgroundColor: '#4A628A'
                }}>
                {(<Backdrop
                    sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                    open={openBackdrop}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>)}
                <Snackbar
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    open={openSnackbar}
                    onClose={handleSnackbarClose}
                    autoHideDuration={2000}
                    message={snackbarMessage}
                />
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '100vw',
                    height: '14vh',
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
                        width: '100vw',
                        height: '14vh',
                        alignItems: 'center',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        marginRight: '3vw'
                    }}>
                        <Typography sx={{
                            fontSize: '1.3em',
                            marginLeft: '1vw',
                            color: '#DFF2EB',
                        }}>
                            Hello, <span style={{fontWeight: 'bold'}}>{username}</span>
                        </Typography>
                        <Tooltip title="Good Bye!">
                            <Button
                                variant="contained"
                                component="label"
                                onClick={handleSignout}
                                sx={{
                                    marginLeft: '2vw',
                                    backgroundColor: '#800000',
                                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)',
                                    '&:hover': {
                                        backgroundColor: '#d40000',
                                    }
                                }}>
                                <LogoutIcon />
                            </Button>
                        </Tooltip>
                    </Box>
                </Box>
                <Box sx={{
                    display: 'flex',
                    width: '100vw',
                    height: '78vh',
                    backgroundColor: '#4A628A'
                }}>
                    <Box sx={{ width: '30vw',
                        height: '72vh',
                        display: 'flex',
                        flexDirection: 'column',
                        margin: '5vh',
                        marginTop: '0vh',
                        marginRight: '2.5vh',
                        borderRadius: '10px',
                        justifyContent: 'flex-start',
                        backgroundColor: '#7AB2D3'
                    }}>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            width: '90%',
                            height: '10vh',
                            margin: '5%',
                            marginBottom: '2.5%',
                            borderRadius: '10px',
                            backgroundColor: '#ccd8d9',
                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)'
                        }}>
                            <Button
                                variant="contained"
                                component="label"
                                disabled={selectDisabled}
                                sx={{
                                    marginLeft: '1vw',
                                    backgroundColor: '#303e57',
                                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)',
                                    '&:hover': {
                                        backgroundColor: '#4A628A',
                                    }
                                }}>
                                {selectButtonText}
                                <input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    onChange={handleSelectButton}
                                    hidden
                                />
                            </Button>
                            <Typography
                                color="#303e57"
                                sx={{
                                    marginLeft: '2vw',
                                    fontWeight: 'bold',
                                }}>
                                {fileName}
                            </Typography>
                        </Box>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '5%',
                            width: '80%',
                            flexGrow: 1,
                            margin: '5%',
                            marginTop: '2.5%',
                            marginBottom: '2.5%',
                            borderRadius: '10px',
                            backgroundColor: '#ccd8d9',
                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)'
                        }}>
                            <Typography
                                color="#303e57"
                                sx={{
                                    fontWeight: 'bold',
                                    margin: '1%'
                                }}>
                                FILE SIZE: {fileSize}
                            </Typography>
                            <Typography
                                color="#303e57"
                                sx={{
                                    fontWeight: 'bold',
                                    margin: '1%'
                                }}>
                                NO. OF ROWS: {numberOfRows}
                            </Typography>
                            <Typography
                                color="#303e57"
                                sx={{
                                    fontWeight: 'bold',
                                    margin: '1%'
                                }}>
                                NO. OF COLUMNS: {numberOfColumns}
                            </Typography>
                            <Typography
                                color='#c96800'
                                sx={{
                                    fontWeight: 'bold',
                                    margin: '1%',
                                    marginTop: '30%'
                                }}>
                                CAUTION: Following fields are required: Gender, 10th Marks, 12th Marks, Stream and CGPA.
                            </Typography>
                        </Box>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            width: '100%',
                            height: '10vh',
                            borderRadius: '10px',
                            marginBottom: '1vh',
                            backgroundColor: '#7AB2D3'
                        }}>
                            {uploadError && (<Typography sx={{
                                fontSize: '1em',
                                marginLeft: '1vw',
                                fontWeight: 400,
                                color: '#ffffff',
                                backgroundColor: '#d40000',
                                width: '62%',
                                padding: '1%'
                            }}>
                                {uploadErrorMessage}
                            </Typography>)}
                            <Button
                                variant="contained"
                                disabled={uploadDisabled}
                                component="label"
                                onClick={handleUploadButton}
                                sx={{
                                    margin: '1.5vw',
                                    backgroundColor: '#303e57',
                                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)',
                                    '&:hover': {
                                        backgroundColor: '#e06c00',
                                    }
                                }}>
                                Upload
                            </Button>
                        </Box>
                    </Box>
                    <Box sx={{ width: '65vw',
                        height: '72vh',
                        margin: '5vh',
                        marginTop: '0vh',
                        marginLeft: '2.5vh',
                        borderRadius: '10px',
                        backgroundColor: '#7AB2D3'
                    }}>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-evenly',
                            weight: '100%',
                            height: '24vh',
                            borderRadius: '10px',
                            backgroundColor: '#7AB2D3'
                        }}>
                            <Box sx={{
                                display: 'flex',
                                width: '10vw',
                                marginLeft: '1.2vw',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                borderRadius: '10px',
                                backgroundColor: '#7AB2D3'
                            }}>
                                <Button
                                    variant="contained"
                                    component="label"
                                    disabled={analyzeDisabled}
                                    onClick={handleAnalyzeButton}
                                    sx={{
                                        margin: '1vw',
                                        backgroundColor: '#303e57',
                                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)',
                                        '&:hover': {
                                            backgroundColor: '#e06c00',
                                        }
                                    }}>
                                    Analyze
                                </Button>
                                <Button
                                    variant="contained"
                                    component="label"
                                    disabled={downloadDisabled}
                                    onClick={handleDownloadButton}
                                    sx={{
                                        margin: '1vw',
                                        backgroundColor: '#303e57',
                                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)',
                                        '&:hover': {
                                            backgroundColor: '#4A628A',
                                        }
                                    }}>
                                    Download
                                </Button>
                            </Box>
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                width: '15vw',
                                height: '18vh',
                                borderRadius: '10px',
                                margin: '0.5vw',
                                marginTop: '1.5vw',
                                backgroundColor: placeableColor,
                                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)'
                            }}>
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    width: '60%',
                                    height: '100%',
                                    borderRadius: '10px',
                                }}>
                                    <Typography
                                        color='#333333'
                                        sx={{
                                            fontSize: '3.6em',
                                            fontWeight: '400',
                                            margin: 'auto',
                                            marginBottom: '0',
                                            marginTop: '0',
                                            height: '60%'
                                    }}>
                                        {placeablePercentage}%
                                    </Typography>
                                    <Typography
                                        color='#2b2b2b'
                                        sx={{
                                            display: 'flex',
                                            fontSize: '1em',
                                            fontWeight: '600',
                                            height: '20%',
                                            justifyContent: 'center'
                                        }}>
                                        ~ PLACEABLE
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    width: '40%',
                                    Height: '100%'
                                }}>
                                    <Box sx={{
                                        display: 'flex',
                                        width: '100%',
                                        height: '40%',
                                        borderTopRightRadius: '10px',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#ebebeb',
                                    }}>
                                        <Typography
                                            color='#2b2b2b'
                                            sx={{
                                                fontSize: '2em',
                                                fontWeight: '400',
                                            }}>
                                            {placeableCount}
                                        </Typography>
                                    </Box>
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        width: '100%',
                                        height: '60%',
                                        borderBottomRightRadius: '10px',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#d4d4d4'
                                    }}>
                                        <Typography
                                            color='#2b2b2b'
                                            sx={{
                                                fontSize: '1em',
                                                fontWeight: '400',
                                            }}>
                                            OUT OF
                                        </Typography>
                                        <Typography
                                            color='#2b2b2b'
                                            sx={{
                                                fontSize: '2em',
                                                fontWeight: '400',
                                            }}>
                                            {numberOfRows}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                width: '15vw',
                                height: '18vh',
                                borderRadius: '10px',
                                margin: '0.5vw',
                                marginTop: '1.5vw',
                                backgroundColor: '#d79cff',
                                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)'
                            }}>
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    width: '60%',
                                    height: '100%',
                                    borderRadius: '10px',
                                }}>
                                    <Typography
                                        color='#4a4a4a'
                                        sx={{
                                            fontSize: '3.6em',
                                            fontWeight: '400',
                                            margin: 'auto',
                                            marginBottom: '0',
                                            marginTop: '0',
                                            height: '60%'
                                        }}>
                                        {femalePercentage}%
                                    </Typography>
                                    <Typography
                                        color='#2b2b2b'
                                        sx={{
                                            display: 'flex',
                                            fontSize: '1em',
                                            fontWeight: '600',
                                            height: '20%',
                                            justifyContent: 'center'
                                        }}>
                                        ~ FEMALE <FemaleIcon/>
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    width: '40%',
                                    Height: '100%'
                                }}>
                                    <Box sx={{
                                        display: 'flex',
                                        width: '100%',
                                        height: '40%',
                                        borderTopRightRadius: '10px',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#ebebeb',
                                    }}>
                                        <Typography
                                            color='#2b2b2b'
                                            sx={{
                                                fontSize: '2em',
                                                fontWeight: '400',
                                            }}>
                                            {femaleCount}
                                        </Typography>
                                    </Box>
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        width: '100%',
                                        height: '60%',
                                        borderBottomRightRadius: '10px',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#d4d4d4'
                                    }}>
                                        <Typography
                                            color='#2b2b2b'
                                            sx={{
                                                fontSize: '1em',
                                                fontWeight: '400',
                                            }}>
                                            OUT OF
                                        </Typography>
                                        <Typography
                                            color='#2b2b2b'
                                            sx={{
                                                fontSize: '2em',
                                                fontWeight: '400',
                                            }}>
                                            {numberOfRows}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                width: '15vw',
                                height: '18vh',
                                borderRadius: '10px',
                                margin: '0.5vw',
                                marginTop: '1.5vw',
                                backgroundColor: '#ae9cff',
                                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)'
                            }}>
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    width: '60%',
                                    height: '100%',
                                    borderRadius: '10px',
                                }}>
                                    <Typography
                                        color='#4a4a4a'
                                        sx={{
                                            fontSize: '3.6em',
                                            fontWeight: '400',
                                            margin: 'auto',
                                            marginBottom: '0',
                                            marginTop: '0',
                                            height: '60%'
                                        }}>
                                        {malePercentage}%
                                    </Typography>
                                    <Typography
                                        color='#2b2b2b'
                                        sx={{
                                            display: 'flex',
                                            fontSize: '1em',
                                            fontWeight: '600',
                                            height: '20%',
                                            justifyContent: 'center'
                                        }}>
                                        ~ MALE <MaleIcon/>
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    width: '40%',
                                    Height: '100%'
                                }}>
                                    <Box sx={{
                                        display: 'flex',
                                        width: '100%',
                                        height: '40%',
                                        borderTopRightRadius: '10px',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#ebebeb',
                                    }}>
                                        <Typography
                                            color='#2b2b2b'
                                            sx={{
                                                fontSize: '2em',
                                                fontWeight: '400',
                                            }}>
                                            {maleCount}
                                        </Typography>
                                    </Box>
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        width: '100%',
                                        height: '60%',
                                        borderBottomRightRadius: '10px',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#d4d4d4'
                                    }}>
                                        <Typography
                                            color='#2b2b2b'
                                            sx={{
                                                fontSize: '1em',
                                                fontWeight: '400',
                                            }}>
                                            OUT OF
                                        </Typography>
                                        <Typography
                                            color='#2b2b2b'
                                            sx={{
                                                fontSize: '2em',
                                                fontWeight: '400',
                                            }}>
                                            {numberOfRows}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            borderRadius: '10px',
                            height: '62%',
                            width: '95.5%',
                            margin: '1.5vw',
                            marginTop: '0',
                            backgroundColor: '#ccd8d9',
                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)'
                        }}>
                            <Box sx={{
                                height: '95%',
                                width: '40%',
                                borderRadius: '10px',
                                backgroundColor: '#f5f5f5',
                                margin: '0.5vw',
                                display: 'flex',
                                justifyContent: 'left',
                                alignItems: 'center'
                            }}>
                                <PieChart
                                    series={[
                                        {
                                            data: [
                                                { id: 0, value: placeablePercentage, label: 'Placeable-%' },
                                                { id: 1, value: (100 - parseInt(placeablePercentage)), label: 'Unplaceable-%' },
                                            ],
                                            innerRadius: 15,
                                            paddingAngle: 3,
                                            cornerRadius: 6,
                                            cx: '40%',
                                            cy: '50%',
                                            highlightScope: { fade: 'global', highlight: 'item' },
                                            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' }
                                        },
                                    ]}
                                    width={400}
                                    height={200}
                                />
                            </Box>
                            <Box sx={{
                                height: '95%',
                                width: '60%',
                                borderRadius: '10px',
                                backgroundColor: '#f5f5f5',
                                margin: '0.5vw',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                paddingLeft: '0.8vw',
                            }}>
                                <BarChart
                                    xAxis={[{ scaleType: 'band', data: ['CSE', 'IT', 'ECE', 'EE', 'AEIE'] }]}
                                    series={[
                                        {data: [CSECounts.FEMALE, ITCounts.FEMALE, ECECounts.FEMALE, EECounts.FEMALE, AEIECounts.FEMALE],
                                            label: 'FEMALE', color: '#b03bff' },
                                        {data: [CSECounts.MALE, ITCounts.MALE, ECECounts.MALE, EECounts.MALE, AEIECounts.MALE],
                                            label: 'MALE', color: '#471fff' }]}
                                    width={500}
                                    height={290}
                                    borderRadius={5}
                                    {...chartSetting}
                                />
                            </Box>
                        </Box>
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
            </Box>
        </>
    );
}

export default Home;