import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const withRouter = (Component) => (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  return <Component {...props} location={location} params={params} navigate={navigate} />;
};

export default withRouter;
