import { test, expect } from '@playwright/test';

test.describe('Login', () => { 

    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000/login');
    })

    test ('Deve fazer login com sucesso', async ({ page }) => {
        await page.fill('#email', 'user@example.com'); 
        await page.fill('#password', 'password123');
        await page.fill('#username', 'user');   
        
        await expect(page.locator('#welcome-title')).toContainText('Bem-vindo, Admin!')
    })

}
)
