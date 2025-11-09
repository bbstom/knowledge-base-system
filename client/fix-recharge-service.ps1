# PowerShell script to fix rechargeService.js

$file = "server/services/rechargeService.js"
$content = Get-Content $file -Raw

# Fix 1: addBalance method
$content = $content -replace `
  '(?s)(async addBalance\(userId, amount, options = \{\}\) \{.*?)(user\.balance \+= amount;)',`
  '$1const balanceBefore = user.balance;$2'

$content = $content -replace `
  '(?s)(const balanceLog = new BalanceLog\(\{[\s\S]*?userId,[\s\S]*?type: options\.type \|\| ''recharge_card'',[\s\S]*?)amount,[\s\S]*?balance: user\.balance,[\s\S]*?description: options\.description.*?,[\s\S]*?metadata: options\.metadata.*?\}\);)',`
  'const balanceLog = new BalanceLog({
        userId,
        type: options.type || ''recharge_card'',
        currency: ''balance'',
        amount,
        balanceBefore,
        balanceAfter: user.balance,
        description: options.description || `卡密充值 +${amount}`
      });'

Write-Host "Fixing rechargeService.js..."
$content | Set-Content $file -NoNewline
Write-Host "Done!"
