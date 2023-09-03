import React, { useCallback, useState } from "react";
import "./styles.css";

function createArrayOfN(n: number) {
  let result = [];
  for (let i = 1; i <= n; i++) {
    result.push(i);
  }

  return result;
}

type Movie = {
  title: string;
  poster?: string;
  rating: number;
};

export default function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [myQueue, setMyQueue] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>();

  const handleFetchMovies = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://www.omdbapi.com/?s=action&apikey=4640ef30&page=1"
      );

      if (response.ok) {
        const moviesData = response.json();
        const data = await moviesData;

        const movieTitles: Movie[] = data?.Search?.map((item: any) => ({
          title: item?.Title,
          poster: item?.Poster,
          rating: 0
        }));

        setMovies(movieTitles);
      }
    } catch (err) {
      console.log("Error Something Went Wrong ", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOnAddQueue = useCallback((data: Movie) => {
    setMyQueue((prev) => [data, ...prev]);
  }, []);

  const handleRemoveMovieFromQueue = useCallback(
    ({ title }: { title: string }) => {
      setMyQueue((data) => data?.filter((m) => m?.title !== title));
    },
    []
  );

  // console.log(JSON.stringify(movies));

  const handleMovieRating = useCallback(
    ({ title, type }: { title: string; type: "add" | "sub" }) => {
      const newData = movies?.map((m) => {
        if (m?.title === title && !!type) {
          return {
            ...m,
            rating:
              type === "add"
                ? Math.min(m?.rating + 1, 5)
                : Math.max(m?.rating - 1, 0)
          };
        }

        return m;
      });

      setMovies(newData);
    },
    [movies]
  );

  if (loading) {
    return <h3>Loading...</h3>;
  }

  return (
    <div>
      <button onClick={handleFetchMovies}>Fetch Movies</button>
      {/* Movies section */}
      <h3>Movies</h3>
      <div className="horizontal-scroll-container">
        {movies?.map((item, index) => (
          <div className="item" key={item?.title + index?.toString()}>
            <img
              src={item?.poster}
              alt={`poster-{item?.poster}`}
              key={item?.title ?? index?.toString()}
            />
            <div style={{ display: "flex" }}>
              <p
                onClick={() => {
                  handleMovieRating({ title: item?.title, type: "sub" });
                }}
              >
                -
              </p>
              {createArrayOfN(item?.rating)?.length <= 0
                ? [1, 2, 3, 4, 5].map((it) => (
                    <span role="img" aria-label={""}>
                      ⚝
                    </span>
                  ))
                : createArrayOfN(item?.rating).map((it) => (
                    <span role="img" aria-label={""}>
                      ⭐
                    </span>
                  ))}
              <p
                onClick={() => {
                  handleMovieRating({ title: item?.title, type: "add" });
                }}
              >
                +
              </p>
            </div>
            <div>
              <p>{`${
                item.title?.length >= 20
                  ? `${item.title?.substring(0, 20)}...`
                  : item.title
              }`}</p>
              <button onClick={() => handleOnAddQueue(item)}>Add Queue</button>
            </div>
          </div>
        ))}
      </div>
      {/* My Queue section */}

      <h3>My Queue</h3>

      <div className="horizontal-scroll-container">
        {myQueue?.length > 0 ? (
          myQueue?.map((item, index) => (
            <div className="item" key={item?.title ?? index?.toString()}>
              <img src={item?.poster} alt={`poster-{item?.poster}`} />
              <div>
                <p>{`${
                  item.title?.length >= 20
                    ? `${item.title?.substring(0, 20)}...`
                    : item.title
                }`}</p>
              </div>
              <div style={{ display: "flex" }}>
                {createArrayOfN(item?.rating).map((it) => (
                  <span role="img" aria-label={""}>
                    ⭐
                  </span>
                ))}
              </div>
              <button
                onClick={() =>
                  handleRemoveMovieFromQueue({ title: item.title })
                }
              >
                Remove
              </button>
            </div>
          ))
        ) : (
          <p>No movies are added in the queue list</p>
        )}
      </div>
    </div>
  );
}
