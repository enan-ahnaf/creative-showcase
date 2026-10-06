'use client'; 

import { useState, useEffect } from 'react';
import { extractColors } from 'extract-colors';
import { supabase } from '../lib/supabase';

export default function Home() {
  // --- AUTH STATE ---
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // --- UPLOAD STATE ---
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [palette, setPalette] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // --- AUTHENTICATION LOGIC ---
  useEffect(() => {
    // Check if logged in on page load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for logins and logouts
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert('Login error: ' + error.message);
  };

  // --- UPLOAD LOGIC ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setImageSrc(url);
      
      extractColors(url)
        .then((colors) => {
          const hexCodes = colors.slice(0, 5).map(color => color.hex);
          setPalette(hexCodes);
        })
        .catch(console.error);
    }
  };

  const handleSave = async () => {
    if (!file || !title) {
      alert('Please provide a title and select an image.');
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`; 
      
      const { error: uploadError } = await supabase.storage
        .from('Artworks') 
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('Artworks') 
        .getPublicUrl(fileName);
        
      const imageUrl = publicUrlData.publicUrl;

      const { error: dbError } = await supabase
        .from('artworks') 
        .insert({
          title: title,
          image_url: imageUrl,
          color_palette: palette 
        });

      if (dbError) throw dbError;

      alert('Artwork saved successfully!');
      
      setFile(null);
      setImageSrc(null);
      setTitle('');
      setPalette([]);
      
    } catch (error: any) {
      console.error('Error saving artwork:', error);
      alert('Error: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // --- SCREEN 1: LOGIN UI ---
  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-12 text-gray-800">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-white p-8 rounded-lg shadow-md flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-center mb-4">Admin Login</h1>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 rounded p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-gray-300 rounded p-2" required />
          </div>
          <button type="submit" className="mt-4 bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 transition-colors">
            Sign In
          </button>
        </form>
      </main>
    );
  }

  // --- SCREEN 2: DASHBOARD UI ---
  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-gray-50 text-gray-800">
      <div className="w-full max-w-md flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button onClick={() => supabase.auth.signOut()} className="text-sm font-semibold text-red-600 hover:text-red-800">
          Log Out
        </button>
      </div>
      
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Artwork Title</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded p-2"
            placeholder="e.g. Neon Nights"
          />
        </div>

        <div className="flex flex-col items-center mt-2 mb-4 border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
          <label className="block text-lg font-bold mb-4 text-gray-800">
            Upload File
          </label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload} 
            className="w-full max-w-xs text-sm text-gray-500
              file:mr-4 file:py-2.5 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-600 file:text-white
              hover:file:bg-blue-700 hover:file:cursor-pointer
              cursor-pointer"
          />
        </div>

        {imageSrc && (
          <div className="flex flex-col items-center gap-4 mt-4">
            <img 
              src={imageSrc} 
              alt="Upload preview" 
              className="max-h-64 rounded-md shadow-sm"
            />
            <div className="flex gap-2">
              {palette.map((color, index) => (
                <div 
                  key={index} 
                  className="w-10 h-10 rounded-full shadow-inner border border-gray-200" 
                  style={{ backgroundColor: color }} 
                  title={color}
                />
              ))}
            </div>
          </div>
        )}

        <button 
          onClick={handleSave}
          disabled={isUploading || !file || !title}
          className="mt-4 bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {isUploading ? 'Saving to Cloud...' : 'Save Artwork'}
        </button>
      </div>
    </main>
  );
}