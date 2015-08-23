export default class Card extends React.Component {
  render() {
    return (
      <div
        style={{
          background: '#fff',
          border: '1px solid rgba(0, 0, 0, .08)',
          borderRadius: 3,
          margin: '10px 0',
          padding: 20,
        }}
        >
        {this.props.children}
      </div>
    );
  }
}
