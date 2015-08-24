const marked = require('marked');

export default class Markdown extends React.Component {
  render() {
    // We want to link up any @username mention to that person's GitHub profile.
    // Since this happens before we convert the markdown to HTML, we can just
    // use markdown stynax.
    const augmentedSource = this.props.source.replace(
      // \b doesn't work with @, so we need to match on either the beginning of
      // the string or whitespace.
      /(^|\s)@(\w+)/, '$1[@$2](https://github.com/$2)');

    return (
      <span
        className='Markdown'
        dangerouslySetInnerHTML={{ __html: marked(augmentedSource) }}
      />
    );
  }
}
