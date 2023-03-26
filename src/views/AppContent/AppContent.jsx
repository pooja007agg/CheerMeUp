import React, { useEffect, Fragment } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

import { AppBarComponent } from '../../components';
import Footer from '../../components/Footer/Footer';
import CustomizedSnackbars from '../../views/Snackbar/CustomSnackbar';

const AppContent = ({ routes }) => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        location.pathname === '/' && navigate('/queue');
        location.pathname === '' && navigate('/queue');

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Fragment>
            <AppBarComponent />
                <Routes>
                    {routes.map((route) => (
                        <Route key={route.id} path={route.path} element={<route.component />} />
                    ))}
                </Routes>
        </Fragment>
    );
};

export default AppContent;
