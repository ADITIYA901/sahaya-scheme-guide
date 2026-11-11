# Sahaya Bot Guide

build Me a exact project like this https://sahaya-mitra-ai.lovable.app/  just change the ui and bakground olour and keep all the features saem

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://sahaya-bot-guide.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1b9cc3a0-d35d-417a-9347-9860154af520).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

### Configure the AI assistant locally

The chat and PDF assistant call OpenRouter from the server. Create an API key in [OpenRouter settings](https://openrouter.ai/settings/keys), then add it to `.env.local` in the project root:

```env
OPENROUTER_API_KEY=your_key_here
OPENROUTER_MODEL=openrouter/free
```

The model line is optional. `openrouter/free` selects an available free model, so responses and availability can vary; OpenRouter's free plan currently allows 50 requests per day. Restart `npm run dev` after saving. Keep the key private: do not use a `VITE_` prefix, expose it in browser code, or commit it.
