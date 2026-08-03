
with open('README.md', 'a', encoding='utf-8') as f:
    f.write("""
---

## Security Posture & Playbook

### Environment Variables
This application enforces strict environment variable separation for secrets. The following keys must be present in the `.env` file at the root of the project:
- `JWT_SECRET`: Used for signing patient authentication tokens.
- `POSTGRES_PASSWORD`: Database password for local/remote connections.
- `PAYSTACK_SECRET_KEY`: Secret key for payment processing.
- `PAYSTACK_PUBLIC_KEY`: Public key for the frontend checkout.

**If these variables are missing, the server will either fail to boot or log severe warnings, and certain functionalities (like auth and payments) will be blocked.**

### Key Rotation Playbook
In the event of a suspected breach or regular security audit, follow these steps to rotate keys:
1. **Paystack/External APIs**: Log into your respective dashboard (e.g., Paystack Dashboard -> Settings -> API Keys). Generate new secret and public keys.
2. **Update `.env`**: Replace the old keys in your production `.env` file with the newly generated ones.
3. **Burn Old Keys**: In the external dashboard, explicitly **revoke** or delete the old keys to ensure they can no longer be used.
4. **Internal Keys (JWT)**: Generate a new random cryptographically secure string (e.g., `openssl rand -hex 32` or via Node crypto) and update `JWT_SECRET`. Note: Rotating `JWT_SECRET` will immediately invalidate all active user sessions, requiring them to log in again.
5. **Restart Service**: Restart your Node.js application or Vercel instance to apply the new `.env` variables.

### Pre-Commit Hook Security
This repository is configured with a Git `pre-commit` hook located at `.git/hooks/pre-commit`.
- **Purpose**: It uses regular expressions to scan every staged commit for patterns matching AWS keys, Stripe/Paystack keys, JWT tokens, and hardcoded passwords.
- **Action**: If a secret is detected, the commit is blocked to prevent accidental leaks.
- **Bypass**: If you encounter a false positive (e.g., a documentation example), you can bypass the hook using `git commit --no-verify`. **Use this with extreme caution.**
""")
print("SUCCESS: README.md updated with Security Playbook.")
