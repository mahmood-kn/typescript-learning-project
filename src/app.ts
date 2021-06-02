// Project
enum ProjectStatus {
  ACTIVE,
  FINISHED,
}
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}
type Listener<T> = (item: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

// Project State Management
class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;
  private constructor() {
    super();
  }

  addProject(title: string, desc: string, people: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      desc,
      people,
      ProjectStatus.ACTIVE
    );
    this.projects.push(newProject);
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }
}
const projectState = ProjectState.getInstance();

//Validation
interface Validatable {
  name: string;
  value: string | number;
  requiered?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validateData: Validatable): [boolean, string] {
  let isValid = true;
  let errMsg = '';
  if (validateData.requiered) {
    isValid = isValid && validateData.value.toString().trim().length !== 0;
    errMsg = !isValid ? `${validateData.name} is requiered` : '';
  }
  if (
    validateData.minLength != null &&
    typeof validateData.value === 'string'
  ) {
    isValid = isValid && validateData.value.length >= validateData.minLength;
    errMsg = !isValid
      ? `${validateData.name} Must be between ${validateData.minLength} and ${validateData.maxLength} charecters`
      : '';
  }

  if (
    validateData.maxLength != null &&
    typeof validateData.value === 'string'
  ) {
    isValid = isValid && validateData.value.length <= validateData.maxLength;
    errMsg = !isValid
      ? `${validateData.name} Must be between ${validateData.minLength} and ${validateData.maxLength} charecters`
      : '';
  }

  if (validateData.min != null && typeof validateData.value === 'number') {
    isValid = isValid && validateData.value >= validateData.min;
    errMsg = !isValid
      ? `${validateData.name} Must be between ${validateData.min} and ${validateData.max}`
      : '';
  }
  if (validateData.max != null && typeof validateData.value === 'number') {
    isValid = isValid && validateData.value <= validateData.max;
    errMsg = !isValid
      ? `${validateData.name} Must be between ${validateData.min} and ${validateData.max}`
      : '';
  }
  return [isValid, errMsg];
}

function AutoBind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjDescriptor;
}

// Component Base class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateEl: HTMLTemplateElement;
  hostEl: T;
  element: U;
  constructor(
    templateId: string,
    hostElId: string,
    insertAtStart: boolean,
    newElId?: string
  ) {
    this.templateEl = document.getElementById(
      templateId
    )! as HTMLTemplateElement;

    this.hostEl = document.getElementById(hostElId)! as T;
    const importedNode = document.importNode(this.templateEl.content, true);
    this.element = importedNode.firstElementChild as U;
    if (newElId) {
      this.element.id = newElId;
    }
    this.attach(insertAtStart);
  }
  private attach(insertAtBeginning: boolean) {
    this.hostEl.insertAdjacentElement(
      insertAtBeginning ? 'afterbegin' : 'beforeend',
      this.element
    );
  }
  abstract configure(): void;
  abstract renderContent(): void;
}
// ProjecItem Class
class ProjecItem extends Component<HTMLUListElement, HTMLLIElement> {
  private project: Project;

  get persons() {
    if (this.project.people === 0) {
      return '1 person';
    } else {
      return `${this.project.people} persons`;
    }
  }

  constructor(hostId: string, project: Project) {
    super('single-project', hostId, false, project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }
  configure() {}
  renderContent() {
    this.element.querySelector('h2')!.textContent = this.project.title;
    this.element.querySelector('h3')!.textContent = this.persons + ' assigned';
    this.element.querySelector('p')!.textContent = this.project.description;
  }
}

// ProjectList Class
class ProjectList extends Component<HTMLDivElement, HTMLElement> {
  assignedProjects: Project[];
  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`);
    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  }

  configure() {
    projectState.addListener((projects: Project[]) => {
      const relevantProject = projects.filter((prj) => {
        if (this.type === 'active') {
          return prj.status === ProjectStatus.ACTIVE;
        }
        return prj.status === ProjectStatus.FINISHED;
      });
      this.assignedProjects = relevantProject;
      this.renderProjects();
    });
  }

  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent =
      this.type.toUpperCase() + ' PROJECTS';
  }

  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    listEl.innerHTML = '';
    for (const prjItme of this.assignedProjects) {
      new ProjecItem(this.element.querySelector('ul')!.id, prjItme);
    }
  }
}

// PojectInput Class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputEl: HTMLInputElement;
  descriptionInputEl: HTMLTextAreaElement;
  peopleInputEl: HTMLInputElement;
  titleErrorEl: HTMLParagraphElement;
  descErrorEl: HTMLParagraphElement;
  peopleErrorEl: HTMLParagraphElement;
  constructor() {
    super('project-input', 'app', true, 'user-input');

    this.titleErrorEl = this.element.querySelector(
      '#titleError'
    ) as HTMLParagraphElement;

    this.descErrorEl = this.element.querySelector(
      '#descError'
    ) as HTMLParagraphElement;

    this.peopleErrorEl = this.element.querySelector(
      '#peopleError'
    ) as HTMLParagraphElement;

    this.titleInputEl = this.element.querySelector(
      '#title'
    ) as HTMLInputElement;

    this.descriptionInputEl = this.element.querySelector(
      '#description'
    ) as HTMLTextAreaElement;

    this.peopleInputEl = this.element.querySelector(
      '#people'
    ) as HTMLInputElement;

    this.configure();
  }
  configure() {
    this.element.addEventListener('submit', this.submitHandler);
  }

  renderContent() {}

  private showError(el: HTMLParagraphElement, msg: string) {
    el.innerText = msg;
  }

  private gatherInputs(): [string, string, number] | void {
    const title = this.titleInputEl.value;
    const description = this.descriptionInputEl.value;
    const people = +this.peopleInputEl.value;
    const validateTitle: Validatable = {
      name: 'Title',
      value: title,
      requiered: true,
    };
    const validateDesc: Validatable = {
      name: 'Description',
      value: description,
      requiered: true,
      minLength: 5,
      maxLength: 15,
    };
    const validatePeople: Validatable = {
      name: 'People',
      value: people,
      requiered: true,
      min: 1,
      max: 5,
    };

    if (
      !validate(validateTitle)[0] ||
      !validate(validateDesc)[0] ||
      !validate(validatePeople)[0]
    ) {
      this.showError(this.titleErrorEl, validate(validateTitle)[1]);
      this.showError(this.descErrorEl, validate(validateDesc)[1]);
      this.showError(this.peopleErrorEl, validate(validatePeople)[1]);
      return;
    } else {
      return [title, description, +people];
    }
  }

  private clearInputs() {
    this.titleInputEl.value = '';
    this.descriptionInputEl.value = '';
    this.peopleInputEl.value = '';
    this.titleErrorEl.innerText = '';
    this.descErrorEl.innerText = '';
    this.peopleErrorEl.innerText = '';
  }

  @AutoBind
  private submitHandler(e: Event) {
    e.preventDefault();
    const userInputs = this.gatherInputs();
    if (Array.isArray(userInputs)) {
      const [title, desc, people] = userInputs;
      projectState.addProject(title, desc, people);
      this.clearInputs();
    }
  }
}
const projInput = new ProjectInput();
const activePrjList = new ProjectList('active');
const finishedPrjList = new ProjectList('finished');
