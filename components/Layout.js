import React from 'react';
import { Container } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

import Header from './Header';
import ErrorBoundary from './ErrorBoundary';

const layout = (props) => {
    return (
        <ErrorBoundary>
            <Container>
                <Header />
                {props.children}
            </Container>
        </ErrorBoundary>
    )
}

export default layout;