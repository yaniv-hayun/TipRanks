import React from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ToolTip from '@mui/material/Tooltip';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PersonIcon from '@mui/icons-material/Person';
import HighlightedText from './HighlightedText';
import type { AutocompleteResult, StockResult, ExpertResult } from '../types';

interface ResultItemProps {
  result: AutocompleteResult;
  query: string;
}

/** Format large numbers as $3.9T, $410B, $245M, etc. */
function formatMarketCap(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(0)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
  return `$${value.toLocaleString()}`;
}

const expertTypeColors: Record<string, string> = {
  analyst: '#6C63FF',
  insider: '#FF6B6B',
  blogger: '#00D4AA',
};

const ResultItem: React.FC<ResultItemProps> = ({ result, query }) => {
  if (result.type === 'stock') {
    return <StockItem stock={result} query={query} />;
  }
  return <ExpertItem expert={result} query={query} />;
};

const StockItem: React.FC<{ stock: StockResult; query: string }> = ({
  stock,
  query,
}) => (
  <ListItem
    sx={{
     mb: 0.5,
      px: 2,
      py: 1,
      transition: 'background-color 0.15s ease',
      '&:hover': {
        backgroundColor: 'rgba(108, 99, 255, 0.08)',
      },
    }}
  >
    <TrendingUpIcon
      sx={{ color: 'primary.light', mr: 1.5, fontSize: '1.2rem' }}
    />
    <ListItemText
      disableTypography
      primary={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color: 'primary.light',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.8rem',
              minWidth: 60,
            }}
          >
            <HighlightedText text={stock.ticker} query={query} />
          </Typography>
          <HighlightedText text={stock.name} query={query} />
        </Box>
      }
    />
    <ToolTip title={`$${stock.marketCap.toLocaleString()}`}>
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          fontWeight: 600,
          fontSize: '0.8rem',
          whiteSpace: 'nowrap',
          cursor: "pointer",
          ml: 2,
          '&:hover': {
            color: 'white',
          },
        }}
      >
        {formatMarketCap(stock.marketCap)}
      </Typography>
    </ToolTip>
  </ListItem>
);

const ExpertItem: React.FC<{ expert: ExpertResult; query: string }> = ({
  expert,
  query,
}) => (
  <ListItem
    sx={{
      borderRadius: 2,
      mx: 1,
      mb: 0.5,
      px: 2,
      py: 1,
      transition: 'background-color 0.15s ease',
      '&:hover': {
        backgroundColor: 'rgba(108, 99, 255, 0.08)',
      },
    }}
  >
    <PersonIcon
      sx={{ color: 'primary.light', mr: 1.5, fontSize: '1.2rem' }}
    />
    <ListItemText
      disableTypography
      primary={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <HighlightedText text={expert.name} query={query} />
          <Chip
            label={expert.expertType}
            size="small"
            sx={{
              backgroundColor: `${expertTypeColors[expert.expertType] ?? '#666'}20`,
              color: expertTypeColors[expert.expertType] ?? '#666',
              borderColor: `${expertTypeColors[expert.expertType] ?? '#666'}40`,
              border: '1px solid',
            }}
          />
        </Box>
      }
    />
  </ListItem>
);

export default ResultItem;
