import React, { useState, useCallback } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';

interface SearchBoxProps {
  onQueryChange: (query: string) => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({ onQueryChange }) => {
  const [value, setValue] = useState('');

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      onQueryChange(newValue);
    },
    [onQueryChange],
  );

  return (
    <TextField
      id="autocomplete-search-input"
      fullWidth
      value={value}
      onChange={handleChange}
      placeholder="Search stocks & experts..."
      variant="outlined"
      autoComplete="off"
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          ),
        },
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          backgroundColor: 'background.paper',
          borderRadius: 3,
          fontSize: '1rem',
          '& fieldset': {
            borderColor: 'rgba(108, 99, 255, 0.2)',
          },
          '&:hover fieldset': {
            borderColor: 'rgba(108, 99, 255, 0.4)',
          },
          '&.Mui-focused fieldset': {
            borderColor: 'primary.main',
            borderWidth: 2,
          },
        },
      }}
    />
  );
};

export default SearchBox;
