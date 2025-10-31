export const EXPORT_CONFIG = {
    PDF: {
      MARGIN: 50,
      FONT_SIZE: {
        TITLE: 20,
        HEADER: 14,
        LABEL: 12,
        VALUE: 11,
      },
      MIN_COLUMN_WIDTH: 80,
      MAX_COLUMN_WIDTH: 150,
      PAGE_BREAK_THRESHOLD: 150,
    },
    CSV: {
      DATE_FORMAT: 'en-US',
    },
    EXCLUDED_FIELDS: ['__v', '_id'],
    FILE_NAME_PREFIX: 'contact-requests',
  };
  