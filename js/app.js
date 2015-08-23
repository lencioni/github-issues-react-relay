import App from './components/App';
import AppHomeRoute from './routes/AppHomeRoute';

React.render(
  <Relay.RootContainer
    Component={App}
    route={new AppHomeRoute()}
    renderLoading={() =>
      <div
        style={{
          left: '50%',
          position: 'absolute',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        >
        Loading…
      </div>
    }
  />,
  document.getElementById('root')
);
