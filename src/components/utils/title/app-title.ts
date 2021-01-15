import { generateComponent } from '/core/component-factory/index.js'
import { css, html, raw } from '/core/templates/index.js'
import { ComponentObject } from '/core/component-factory/types.js'
import { globalConfigs } from '/store/global.js'
import userService from '/store/services/user-service.js'
import router from '/core/router/index.js'
import { RawHTML } from '/core/templates/raw-html-template.js'

export type TitleElement = HTMLElement & {
  logIn(): void
}

type TitleComponent = ComponentObject & {
  isLoged: boolean
  readonly logInDetails: RawHTML
}

const Title = <TitleComponent> {
  isLoged: false,

  init() {
    globalConfigs.logOut = () => {
      this.isLoged = false
      userService.logout()
      this.select('.user-details-container').remove()
      router.go('/')
    }

    globalConfigs.logIn = () => {
      if (!globalConfigs.currentUser) return

      !this.isLoged && (
        this.select('.container').innerHTML += this.logInDetails
      )

      const logoutBtn = this.select('button')
      logoutBtn?.addEventListener('click', () => globalConfigs.logOut())

      this.isLoged = true
      
      return true
    }

    globalConfigs.logIn()
  },

  get logInDetails() {
    return raw`
      <div class="user-details-container">
        <span>
          ${globalConfigs.currentUser?.name as string}
        </span>

        <button class="btn">Log out</button>
      </div>
    `
  },

  render() {
    return html`
      <div class="container">
        <h1>My App</h1>
      </div>
    `
  }
}

generateComponent(Title, {
  tag: 'app-title',
  cssPaths: ['css/styles.css'],
  cssString: css`
    .container {
      display: flex;
      background-color: #333;
      padding: 16px 12px;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      box-sizing: border-box;
    }

    h1 {
      margin: 0;
      color: white;
      width: 110px;
    }

    .user-details-container {
      color: white;
      font-size: 1.1rem;
      width: 200px;
    }

    button.btn {
      color: white;
    }
  `
})