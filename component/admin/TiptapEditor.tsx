'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

export default function TiptapEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {

  const editor = useEditor({

    extensions: [StarterKit],

    content: value,

    editorProps: {
      attributes: {
        class:
          'min-h-[200px] border rounded-xl p-4 outline-none',
      },
    },

    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
  })

  return <EditorContent editor={editor} />
}