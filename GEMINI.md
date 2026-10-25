# AI Token Efficiency Rules

## Response Style
- Gunakan bahasa Indonesia kecuali diminta sebaliknya.
- Jawab **singkat dan langsung ke inti**. Hindari kalimat pembuka/penutup yang tidak perlu (e.g., "Tentu!", "Baik, saya akan...").
- Jangan ulangi kembali isi file atau kode yang baru saja dibaca/ditulis — cukup sebutkan apa yang berubah.
- Jangan tambahkan penjelasan yang sudah jelas dari kode itu sendiri.

## Code Changes
- Tunjukkan hanya **diff / bagian kode yang berubah**, bukan seluruh file.
- Jangan sertakan komentar kode yang tidak informatif (e.g., `// ini adalah fungsi`).
- Jangan menulis ulang kode yang tidak berubah kecuali dibutuhkan untuk konteks.

## Tool Usage
- Baca file secukupnya — gunakan `StartLine`/`EndLine` jika hanya sebagian yang relevan.
- Jangan lakukan `grep` atau `list_dir` berulang untuk informasi yang sudah diketahui.
- Gunakan search semantik (grep) sebelum membaca seluruh file besar.

## Planning & Analysis
- Langsung eksekusi untuk tugas sederhana — tanya konfirmasi hanya jika ada ambiguitas tinggi atau risiko destruktif.
- Hindari membuat artifact/dokumen panjang untuk tugas yang jawabannya bisa singkat.
