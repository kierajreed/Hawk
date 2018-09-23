const DEFAULT_FONT = 'Consolas';
module.exports.DEFAULT_FONT = DEFAULT_FONT;

const DEFAULT_SETTINGS =
`
# Hawk Editor Settings
# Restart Hawk to apply changes.

# The font to use in the editor.
font: '${DEFAULT_FONT}'
`;

// Export settings without the newlines on either end.
module.exports.DEFAULT_SETTINGS = DEFAULT_SETTINGS.substring(1, DEFAULT_SETTINGS.length - 1);
