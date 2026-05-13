type Service = {
  title: string;
  description: string;
};

const services: Service[] = [
  {
    title: 'Ilustración personalizada',
    description: 'Diseños en tinta creados para marcas y proyectos únicos.'
  },
  {
    title: 'Diseño editorial',
    description: 'Piezas visuales para publicaciones impresas y digitales.'
  },
  {
    title: 'Identidad visual',
    description: 'Conceptos de marca coherentes y listos para crecer.'
  }
];

const servicesContainer = document.querySelector<HTMLDivElement>('#services');
const yearElement = document.querySelector<HTMLElement>('#year');
const themeToggle = document.querySelector<HTMLButtonElement>('#theme-toggle');

if (servicesContainer) {
  services.forEach((service) => {
    const card = document.createElement('article');
    card.className = 'card';

    const title = document.createElement('h3');
    title.textContent = service.title;

    const description = document.createElement('p');
    description.textContent = service.description;

    card.append(title, description);
    servicesContainer.append(card);
  });
}

if (yearElement) {
  yearElement.textContent = `© ${new Date().getFullYear()} Picaflor INK`;
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const nextTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    document.body.dataset.theme = nextTheme;
  });
}
