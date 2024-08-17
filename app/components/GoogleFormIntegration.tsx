import React, { useState, useEffect } from 'react';

interface FieldConfig {
  label: string;
  type: string;
}

interface FormConfig {
  formUrl: string;
  fieldOverrides?: Record<string, Partial<FieldConfig>>;
  styles?: React.CSSProperties;
}

interface GoogleFormIntegrationProps {
  config: FormConfig;
  isEnabled: boolean;
}

export const GoogleFormIntegration: React.FC<GoogleFormIntegrationProps> = ({ config, isEnabled }) => {
  // State pro ukládání polí formuláře a dat formuláře
  const [fields, setFields] = useState<Record<string, FieldConfig>>({});
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEnabled) {
      parseFormUrl(config.formUrl);
    }
  }, [config.formUrl, isEnabled]);

  const parseFormUrl = (url: string) => {
    const parsedUrl = new URL(url);
    const params = new URLSearchParams(parsedUrl.search);
    const newFields: Record<string, FieldConfig> = {};

    params.forEach((value, key) => {
      if (key.startsWith('entry.')) {
        newFields[key] = {
          label: `Question ${Object.keys(newFields).length + 1}`,
          type: 'text', // Default to text, can be overridden
        };
      }
    });

    // Apply field overrides
    if (config.fieldOverrides) {
      Object.entries(config.fieldOverrides).forEach(([key, override]) => {
        if (newFields[key]) {
          newFields[key] = { ...newFields[key], ...override };
        }
      });
    }

    setFields(newFields);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formUrl = new URL(config.formUrl);
    Object.entries(formData).forEach(([key, value]) => {
      formUrl.searchParams.set(key, value);
    });
    window.open(formUrl.toString().replace('/viewform', '/formResponse'), '_blank');
  };

  if (!isEnabled) return null;

  const fullScreenStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    ...config.styles
  };

  return (
    <div style={fullScreenStyle}>
      <form onSubmit={handleSubmit} style={{ width: '80%', maxWidth: '600px' }}>
        {Object.entries(fields).map(([key, field]) => (
          <div key={key} style={{ marginBottom: '15px' }}>
            <label htmlFor={key} style={{ display: 'block', marginBottom: '5px' }}>{field.label}</label>
            <input
              type={field.type}
              id={key}
              name={key}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
        ))}
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}>
          Submit
        </button>
      </form>
    </div>
  );
};
