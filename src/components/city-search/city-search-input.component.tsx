import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import './city-search-input.component.scss';
import { fetchCities, debounce } from '../../services/carbon.service';

interface City {
  name: string;
  country: string;
  state?: string;
  coordinates: [number, number];
}

interface CitySearchInputProps {
  name: string;
  placeholder: string;
  setCity: (city: City | null) => void;
  disabled?: boolean;
  value?: string;
}

export const CitySearchInput: React.FC<CitySearchInputProps> = ({ 
  name, 
  placeholder, 
  setCity,
  disabled = false,
  value 
}) => {
  const form = useFormContext();
  const [cities, setCities] = useState<City[]>([]);

  useEffect(() => {
    if (value) {
      form.setValue(name, value);
    }
  }, [value, name, form]);

  const getCities = debounce(async(event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.length > 2) {
      try {
        const response = await fetchCities(event.target.value);
        if (response) {
          setCities(response);
        }
      } catch (err) {
        console.log('err', err);
      }
    } else {
      setCities([]);
    }
  }, 1000);

  const handleCitySelect = (city: City) => {
    form.setValue(name, city.name);
    setCities([]);
    setCity(city);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      getCities(event);
      if (event.target.value === '') {
        setCity(null);
      }
    }
  };

  return (
    <div className={`search__container ${disabled ? 'search__container--disabled' : ''}`}>
      <div className="search__form-group">
        <input
          type="text"
          placeholder={placeholder}
          autoComplete="off"
          disabled={disabled}
          {...form.register(name, { 
            onChange: handleInputChange,
            required: "City name is required",
            minLength: { value: 2, message: "City name must be at least 2 characters" }
          })}
          className={`search__input ${form.formState.errors[name] ? "search__input--error" : ""}`}
        />
        {form.formState.errors[name] && !disabled && (
          <span className="search__error-message">
            {form.formState.errors[name]?.message as string}
          </span>
        )}
      </div>
      {cities.length > 0 && !disabled && (
        <ul className="search__results">
          {cities.map((city, index) => (
            <li 
              key={index} 
              className="search__result-item"
              onClick={() => handleCitySelect(city)}
            >
              {city.name}, {city.country}{city.state ? `, ${city.state}` : ''}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
