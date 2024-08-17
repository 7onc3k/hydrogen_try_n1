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

  return (
    <form onSubmit={handleSubmit} style={config.styles}>
      {Object.entries(fields).map(([key, field]) => (
        <div key={key}>
          <label htmlFor={key}>{field.label}</label>
          <input
            type={field.type}
            id={key}
            name={key}
            onChange={handleInputChange}
            required
          />
        </div>
      ))}
      <button type="submit">Submit</button>
    </form>
  );
};
