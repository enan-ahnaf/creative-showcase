import { supabase } from '../../lib/supabase'; // Notice the '../' to go up one folder

// This 'async' keyword lets us fetch data directly on the server
export default async function Gallery() {
  // 1. Fetch all artworks from the database
  const { data: artworks, error } = await supabase
    .from('artworks')
    .select('*');

  if (error) {
    console.error('Error fetching artworks:', error);
    return <div>Error loading gallery!</div>;
  }

  return (
    <main className="p-12 min-h-screen bg-gray-50 text-gray-800">
      <h1 className="text-3xl font-bold mb-8 text-center">Artistic Showcase (Raw Data)</h1>
      
      {/* A simple CSS grid to display the artwork cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        
        {/* 2. Map through the data and render a card for each artwork */}
        {artworks?.map((artwork) => (
          <div key={artwork.id} className="bg-white p-4 rounded-lg shadow-md flex flex-col">
            <img 
              src={artwork.image_url} 
              alt={artwork.title} 
              className="w-full h-64 object-cover rounded-md mb-4" 
            />
            
            <h2 className="text-xl font-bold mb-3">{artwork.title}</h2>
            
            {/* 3. Display the AI-extracted color palette */}
            <div className="flex gap-3 mt-auto">
              {artwork.color_palette?.map((color: string, i: number) => (
                <div 
                  key={i} 
                  className="w-8 h-8 rounded-full border border-gray-200 shadow-sm"
                  style={{ backgroundColor: color }}
                  title={color} // Shows the hex code when you hover with the mouse
                />
              ))}
            </div>
          </div>
        ))}

        {artworks?.length === 0 && (
          <p className="col-span-3 text-center text-gray-500">No artworks uploaded yet!</p>
        )}
      </div>
    </main>
  );
}