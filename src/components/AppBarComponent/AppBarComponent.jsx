import * as React from 'react';
import { NavLink } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';

import Container from '@mui/material/Container';
import { APP_CONSTANTS } from '../../config/config';

const { APP_TITLE } = APP_CONSTANTS;

export default function PrimarySearchAppBar({ children, to, ...props }) {
    const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);

    const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

    const handleMobileMenuClose = () => {
        setMobileMoreAnchorEl(null);
    };

    const handleMobileMenuOpen = (event) => {
        setMobileMoreAnchorEl(event.currentTarget);
    };

    const mobileMenuId = 'primary-search-account-menu-mobile Mobile-menu';
    const renderMobileMenu = (
        <Menu
            anchorEl={mobileMoreAnchorEl}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            id={mobileMenuId}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={isMobileMenuOpen}
            onClose={handleMobileMenuClose}
            className=""
        >
            <li className="nav-link mobile-menu-width">
                <NavLink to="/queue">Queue</NavLink>
            </li>
            {/* <li className="nav-link">
                <NavLink to="/members">Members</NavLink>
            </li>
            <li className="nav-link">
                <NavLink to="/questions">Questions</NavLink>
            </li>
            <li className="nav-link">
                <NavLink to="/offers">Offers</NavLink>
            </li>
            <li className="nav-link">
                <NavLink to="/surveys">Surveys</NavLink>
            </li>
            <li className="nav-link">
                <NavLink to="/settings">Settings</NavLink>
            </li>
            <li className="nav-link">
                <NavLink to="/log-out">Log Out</NavLink>
            </li> */}
        </Menu>
    );

    return (
        <Box sx={{ flexGrow: 1, background: '#FFFFFF' }}>
            <AppBar position="static" sx={{ boxShadow: 'none', background: '#FFFFFF' }}>
                <Container maxwidth="sm">
                    <Toolbar className="nvabar" sx={{ justifyContent: 'center' }}>
                        <Typography
                            variant="h3"
                            noWrap
                            component="div"
                            sx={{ display: { xs: 'block', sm: 'block', color: 'black', padding: 20 } }}
                        >
                            Music on my mind
                        </Typography>
                    </Toolbar>
                </Container>
            </AppBar>
            {renderMobileMenu}
        </Box>
    );
}
