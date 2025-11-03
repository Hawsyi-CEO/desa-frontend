import { useRef, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';

const RichTextEditor = ({ value, onChange, placeholder, availableFields = [] }) => {
  const editorRef = useRef(null);
  const fieldsRef = useRef(availableFields); // Store latest fields in ref

  // Update fieldsRef whenever availableFields changes
  useEffect(() => {
    fieldsRef.current = availableFields;
    console.log('🔄 Fields updated in ref:', availableFields.length);
    console.log('🔄 Fields:', availableFields);
  }, [availableFields]);

  // Setup untuk insert placeholder
  const setupEditor = (editor) => {
    editorRef.current = editor;
    console.log('📝 RichTextEditor - Setup editor with fields:', availableFields.length);

    // Add custom button untuk insert placeholder
    // Button ini akan selalu fetch fields terbaru dari fieldsRef
    editor.ui.registry.addMenuButton('insertplaceholder', {
      text: 'Placeholder',
      icon: 'code-sample',
      fetch: (callback) => {
        // Ambil fields terbaru dari ref (bukan dari closure!)
        const currentFields = fieldsRef.current;
        console.log('🔍 Fetching placeholder items from ref, current fields:', currentFields);
        console.log('🔍 Fields count:', currentFields.length);
        
        if (currentFields.length === 0) {
          callback([{
            type: 'menuitem',
            text: 'Belum ada field',
            enabled: false
          }]);
          return;
        }

        const items = currentFields.map(field => ({
          type: 'menuitem',
          text: field.label || field.name,
          onAction: () => {
            // Insert placeholder dengan format {{field_name}}
            const placeholder = `{{${field.name}}}`;
            console.log(`✅ Inserting: ${placeholder} (${field.label})`);
            editor.insertContent(placeholder);
          }
        }));
        callback(items);
      }
    });
  };

  return (
    <Editor
      tinymceScriptSrc={import.meta.env.BASE_URL + 'tinymce/tinymce.min.js'}
      onInit={(evt, editor) => setupEditor(editor)}
      value={value}
      onEditorChange={onChange}
      init={{
        license_key: 'gpl',
        height: 500,
        menubar: false,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | blocks | ' +
          'bold italic forecolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'table | insertplaceholder | ' +
          'removeformat | help',
        table_toolbar: 'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol',
        content_style: `
          body { 
            font-family: Arial, sans-serif; 
            font-size: 12pt; 
            line-height: 1.6;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
          }
          th, td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f0f0f0;
            font-weight: bold;
          }
        `,
        placeholder: placeholder || 'Ketik konten surat di sini...',
        // Konfigurasi table default
        table_default_attributes: {
          border: '1'
        },
        table_default_styles: {
          width: '100%',
          'border-collapse': 'collapse'
        },
        // Allow all HTML tags
        valid_elements: '*[*]',
        extended_valid_elements: '*[*]',
        // Preserve formatting
        verify_html: false,
        cleanup: false,
        convert_urls: false
      }}
    />
  );
};

export default RichTextEditor;
