import React from 'react';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import ResultItem from './ResultItem';
import type { AutocompleteResult, StockResult, ExpertResult } from '../types';

interface ResultListProps {
  results: AutocompleteResult[];
  query: string;
  loading: boolean;
  error: string | null;
}

/**
 * Groups interleaved API results by type (stocks / experts)
 * and renders them under separate subheaders.
 */
const ResultList: React.FC<ResultListProps> = ({
  results,
  query,
  loading,
  error,
}) => {
  // Don't show the dropdown at all if there's no query
  if (!query.trim()) {
    return null;
  }

  // Loading state
  if (loading && results.length === 0) {
    return (
      <Paper
        elevation={8}
        sx={{ mt: 1, p: 3, textAlign: 'center' }}
      >
        <CircularProgress size={28} sx={{ color: 'primary.main' }} />
      </Paper>
    );
  }

  // Error state
  if (error) {
    return (
      <Paper elevation={8} sx={{ mt: 1, p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="error">
          Something went wrong. Please try again.
        </Typography>
      </Paper>
    );
  }

  // Empty state
  if (results.length === 0) {
    return (
      <Paper elevation={8} sx={{ mt: 1, p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No results found for "{query}"
        </Typography>
      </Paper>
    );
  }

  // Group results by type
  const stocks = results.filter((r): r is StockResult => r.type === 'stock');
  const experts = results.filter((r): r is ExpertResult => r.type === 'expert');

  return (
    <Paper
      elevation={8}
      sx={{
        mt: 1,
        py: 1,
        maxHeight: 700,
        overflow: 'hidden',
        '&::-webkit-scrollbar': {
          width: 2,
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(108, 99, 255, 0.3)',
          borderRadius: 3,
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: 4,
              right: 12,
              zIndex: 1,
            }}
          >
            <CircularProgress size={16} sx={{ color: 'primary.light' }} />
          </Box>
        )}

        <List disablePadding>
          {stocks.length > 0 && (
            <>
              <ListSubheader>Stocks</ListSubheader>
              {stocks.map((stock) => (
                <ResultItem
                  key={`stock-${stock.ticker}`}
                  result={stock}
                  query={query}
                />
              ))}
            </>
          )}

          {experts.length > 0 && (
            <>
              <ListSubheader>Experts</ListSubheader>
              {experts.map((expert) => (
                <ResultItem
                  key={`expert-${expert.name}`}
                  result={expert}
                  query={query}
                />
              ))}
            </>
          )}
        </List>
      </Box>
    </Paper>
  );
};

export default ResultList;
