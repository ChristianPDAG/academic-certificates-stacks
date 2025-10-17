export const fetchPosts = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/blog/list`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Ha ocurrido un error al obtener los datos.");
  }
  
  const data = await res.json();
  return data;
};

export const fetchPostsPage = async (p: number) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/blog/list?p=${p}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Ha ocurrido un error al obtener los datos.");
  }

  const data = await res.json();
  return data;
};

export const fetchPost = async (slug: string) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/blog/detail/${slug}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Ha ocurrido un error al obtener los datos.");
  }

  const data = await res.json();
  return data.post;
};

export const fetchCategories = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/category/list`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Ha ocurrido un error al obtener los datos.");
  }
  
  const data = await res.json();
  return data.categories;
};

export const fetchCategory = async (slug: string) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/blog/by_category?slug=${slug}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Ha ocurrido un error al obtener los datos.");
  }

  const data = await res.json();
  return data.results.post;
};
