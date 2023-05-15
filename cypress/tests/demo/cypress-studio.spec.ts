import exp from "constants";
import { User } from "models";
import { userInfo } from "os";

describe("Cypress Studio Demo", function () {
  beforeEach(function () {
    cy.task("db:seed")

    cy.database("find", "users").then((user: User) => {
      cy.login(user.username, "s3cret", { rememberUser: true });
      cy.intercept('/users').as('users')
      cy.intercept('POST','/graphql').as('graphql')
    })
  })
  it("create new transaction", function () {

    const value = '500'
    const note = 'I\'m paying you'

    cy.getBySel('nav-top-new-transaction')
      .should('be.visible').click()

    cy.contains('Select Contact').should('have.class', 'MuiStepLabel-active')
    cy.wait('@users')

    cy.get('ul[data-test="users-list"]>li').eq(1).then(($userObject) => {
      const userObject = $userObject
      cy.wrap(userObject).as('userObject')

    cy.get('@userObject').find('span').eq(0).then(($userName) => {
      const userName = $userName.text()
    
    cy.get('@userObject').click()

    cy.get('h2').should('have.text', userName)
    cy.contains('Payment').should('have.class', 'MuiStepLabel-active')
    cy.getBySel('transaction-create-submit-request').as('requestButton').should('be.disabled')
    cy.getBySel('transaction-create-submit-payment').as('payButton').should('be.disabled')
    cy.get('#amount').type(value).should('have.value', '$500')
    cy.get('#transaction-create-description-input').type(note)
    cy.get('@requestButton').should('be.enabled')
    
    cy.get('@payButton').should('be.enabled').click()

    cy.contains('Complete').should('have.class', 'MuiStepLabel-completed')
    cy.get('h2').eq(0).should('have.text', userName)
    cy.get('h2').eq(1).should('have.text', `Paid $${value}.00 for ${note}`)
    
    cy.contains('Return To Transactions').click()

    cy.getBySel('nav-personal-tab').click()

    cy.location('pathname').should('eq', '/personal')

    cy.getBySel('transaction-list').find('li').eq(0).as('paymentRecord')

    cy.get('@paymentRecord').should('contain', `paid ${userName}`).and('contain', `-$${value}`).and('contain', note)
    })
  })
  })

  it("create new bank account", function () {

    const bankName = 'Gotham Bank'
    cy.getBySel('sidenav-bankaccounts').click()

    cy.location('pathname').should('eq', '/bankaccounts')

    cy.get('ul[data-test="bankaccount-list"]>li').as('bankList').should('have.length', 1)

    cy.getBySel('bankaccount-new').click()

    cy.get('h2').should('have.text', 'Create Bank Account')

    cy.get('#bankaccount-bankName-input').type(bankName)

    cy.get('#bankaccount-routingNumber-input').type('123456789')

    cy.get('#bankaccount-accountNumber-input').type('987654321')

    cy.getBySel('bankaccount-submit').click()

    cy.get('@bankList').should('have.length', 2).and('contain', bankName)
  })

  it.only("delete bank account", function () {
    cy.getBySel('sidenav-bankaccounts').click()

    cy.getBySel('bankaccount-list').its('length').should('be.greaterThan', 0)

    cy.get('ul[data-test="bankaccount-list"]>li').eq(0).as('bank')

    cy.get('@bank').find('p').as('bankName').then(($bank) => {

      expect($bank.text()).to.not.contain('Deleted')

      cy.get('@bank').find('button').as('deleteButton').should('be.enabled').click()

      cy.get('@deleteButton').should('not.exist')

      cy.get('@bankName').then(($bank) => {
        expect($bank.text()).to.contain('Deleted')
      })
    })
  })
})
