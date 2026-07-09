import { useState, useCallback } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SearchBox from './components/SearchBox';
import ResultList from './components/ResultList';
import { useAutocomplete } from './hooks/useAutocomplete';

function App() {
  const [query, setQuery] = useState('');
  const { results, loading, error } = useAutocomplete(query);

  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0A0E1A 0%, #131729 50%, #0F1325 100%)',
        py: 8,
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              background: 'linear-gradient(135deg, #6C63FF 0%, #00D4AA 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            TipRanks Search
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Search across stocks and financial experts
          </Typography>
        </Box>

        <Box sx={{ position: 'relative' }}>
          <SearchBox onQueryChange={handleQueryChange} />
          <ResultList
            results={results}
            query={query}
            loading={loading}
            error={error}
          />
        </Box>
      </Container>
    </Box>
  );
}

export default App;
