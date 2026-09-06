<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Page not found — Nullypto</title>
    <style>
        :root {
            --green-500: #22c55e;
            --green-400: #4ade80;
            --mint-50: #f0fdf4;
            --ink-950: #0b0f0d;
            --text-dark: #0f172a;
            --text-muted: #5b6b66;
            --border-soft: #e3ece7;
        }

        * { box-sizing: border-box; }

        body {
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: var(--text-dark);
            background: var(--mint-50);
            line-height: 1.5;
        }

        .card {
            max-width: 440px;
            width: 100%;
            margin: 24px;
            padding: 48px 40px;
            text-align: center;
        }

        .brand {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 20px;
            font-weight: 800;
            letter-spacing: -0.02em;
            color: var(--ink-950);
            margin-bottom: 40px;
        }

        .brand svg {
            width: 26px;
            height: 26px;
            color: var(--green-500);
            flex-shrink: 0;
        }

        .code {
            font-size: 15px;
            font-weight: 700;
            letter-spacing: 0.08em;
            color: var(--green-500);
            text-transform: uppercase;
            margin-bottom: 12px;
        }

        h1 {
            font-size: 28px;
            font-weight: 800;
            letter-spacing: -0.02em;
            margin: 0 0 12px;
        }

        p {
            color: var(--text-muted);
            font-size: 15px;
            margin: 0 0 32px;
        }

        .btn {
            display: inline-block;
            padding: 12px 28px;
            border-radius: 999px;
            background: linear-gradient(90deg, #22c55e, #22d3a8);
            color: #06210f;
            font-weight: 700;
            font-size: 15px;
            text-decoration: none;
        }

        .btn:hover {
            opacity: 0.92;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="brand">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                <circle cx="12" cy="12" r="3" fill="currentColor" />
            </svg>
            Nullypto
        </div>
        <div class="code">404 error</div>
        <h1>This page isn't available</h1>
        <p>The page you're looking for doesn't exist or isn't accessible right now.</p>
        <a class="btn" href="/">Back to home</a>
    </div>
</body>
</html>
