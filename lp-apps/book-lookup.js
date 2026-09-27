(() => {
  const form = document.querySelector('#lookup-form');
  if (!form) return;
  const input = document.querySelector('#lookup-query');
  const status = document.querySelector('#lookup-status');
  const results = document.querySelector('#lookup-results');
  const cta = document.querySelector('#play-cta');
  const portuguese = document.documentElement.lang.toLowerCase().startsWith('pt');
  const swedish = document.documentElement.lang.startsWith('sv');
  const labels = portuguese
    ? { initial: 'Digite um termo para buscar livros.', loading: 'Buscando no Open Library…', empty: 'Nenhum livro encontrado. Tente outra busca.', error: 'Não foi possível fazer a busca. Verifique sua conexão e tente novamente.', title: 'Título', author: 'Autor(a)', year: 'Publicado pela primeira vez em', source: 'Ver registro no Open Library' }
    : swedish
      ? { initial: 'Skriv en sökterm för att hitta böcker.', loading: 'Söker i Open Library…', empty: 'Inga böcker hittades. Prova en annan sökning.', error: 'Sökningen misslyckades. Kontrollera anslutningen och försök igen.', title: 'Titel', author: 'Författare', year: 'Första utgivningsår', source: 'Visa posten i Open Library' }
      : { initial: 'Enter a search term to look up books.', loading: 'Searching Open Library…', empty: 'No books found. Try another search.', error: 'Search failed. Check your connection and try again.', title: 'Title', author: 'Author', year: 'First published', source: 'View record on Open Library' };

  let requestGeneration = 0;
  let activeController = null;

  function clearResults() {
    results.replaceChildren();
    cta.hidden = true;
  }

  function renderBooks(books) {
    const list = document.createElement('ol');
    books.slice(0, 5).forEach((book) => {
      const item = document.createElement('li');
      const heading = document.createElement('h2');
      heading.textContent = book.title || labels.title;
      item.append(heading);
      if (Array.isArray(book.author_name) && book.author_name.length) {
        const authors = document.createElement('p');
        authors.textContent = `${labels.author}: ${book.author_name.join(', ')}`;
        item.append(authors);
      }
      if (book.first_publish_year) {
        const year = document.createElement('p');
        year.textContent = `${labels.year}: ${book.first_publish_year}`;
        item.append(year);
      }
      if (book.key && /^\/works\/[A-Za-z0-9]+$/.test(book.key)) {
        const link = document.createElement('a');
        link.href = `https://openlibrary.org${book.key}`;
        link.textContent = labels.source;
        item.append(link);
      }
      list.append(item);
    });
    results.append(list);
    cta.hidden = false;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const query = input.value.trim();
    if (!query) return;
    clearResults();
    const generation = ++requestGeneration;
    if (activeController) activeController.abort();
    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    input.disabled = true;
    status.textContent = labels.loading;
    const controller = new AbortController();
    activeController = controller;
    const timeout = window.setTimeout(() => controller.abort(), 10000);
    try {
      const params = new URLSearchParams({ q: query, limit: '5', fields: 'key,title,author_name,first_publish_year' });
      const response = await fetch(`https://openlibrary.org/search.json?${params.toString()}`, { signal: controller.signal });
      if (!response.ok) throw new Error('Request failed');
      const data = await response.json();
      if (generation !== requestGeneration) return;
      const books = Array.isArray(data.docs) ? data.docs : [];
      if (books.length) {
        renderBooks(books);
        status.textContent = '';
      } else status.textContent = labels.empty;
    } catch (_error) {
      if (generation === requestGeneration) status.textContent = labels.error;
    } finally {
      window.clearTimeout(timeout);
      if (generation === requestGeneration) {
        activeController = null;
        submit.disabled = false;
        input.disabled = false;
      }
    }
  });
  form.addEventListener('reset', () => {
    ++requestGeneration;
    if (activeController) {
      activeController.abort();
      activeController = null;
    }
    const submit = form.querySelector('[type="submit"]');
    submit.disabled = false;
    input.disabled = false;
    window.setTimeout(() => {
      clearResults();
      status.textContent = labels.initial;
    }, 0);
  });
})();
