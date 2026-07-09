import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

interface HighlightedTextProps {
  text: string;
  query: string;
}

/**
 * Renders text with the matched query substring wrapped in a <mark> element
 * for visual highlighting. Uses case-insensitive matching on the original
 * (non-normalized) display text.
 */
const HighlightedText: React.FC<HighlightedTextProps> = ({ text, query }) => {
  if (!query || !query.trim()) {
    return <Typography component="span" variant="body1">{text}</Typography>;
  }

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase().trim();
  const matchIndex = lowerText.indexOf(lowerQuery);

  if (matchIndex === -1) {
    return <Typography component="span" variant="body1">{text}</Typography>;
  }

  const before = text.slice(0, matchIndex);
  const match = text.slice(matchIndex, matchIndex + lowerQuery.length);
  const after = text.slice(matchIndex + lowerQuery.length);

  return (
    <Typography component="span" variant="body1">
      {before}
      <Box
        component="mark"
        sx={{
          backgroundColor: 'rgba(108, 99, 255, 0.25)',
          color: 'primary.light',
          borderRadius: '2px',
          padding: '0 2px',
        }}
      >
        {match}
      </Box>
      {after}
    </Typography>
  );
};

export default HighlightedText;
