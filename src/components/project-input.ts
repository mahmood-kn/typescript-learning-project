/// <reference path="./base-component.ts" />
/// <reference path="../decorators/autobind.ts" />
/// <reference path="../util/validation.ts" />
/// <reference path="../state/project-state.ts" />

namespace App {
  export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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
}
