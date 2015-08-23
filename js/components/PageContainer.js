export default class Home extends React.Component {
  render() {
    return (
      <div
        style={{
          margin: '0 auto',
          maxWidth: 700,
          padding: '0 20px',
        }}
        >
        {this.props.children}
      </div>
    );
  }
}
