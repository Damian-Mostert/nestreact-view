# nestjsx [![npm version](https://img.shields.io/npm/v/@damian88/nestjsx)](https://www.npmjs.com/package/@damian88/nestjsx)


**Render React views with server-side support and client-side hydration inside your NestJS or Express app.**

`nestjsx` brings the power of React JSX templates to your NestJS or Express backend. It provides a decorator-based syntax for defining server-side and client-side components, full support for third-party libraries, and seamless SSR-to-hydration transitions — all with zero Webpack config or Babel setup required.

---

## ✨ Features

- ✅ Server-side rendering with React in NestJS / Express
- 🔁 Seamless hydration of client-side components
- ⚙️ Use third-party libraries (like `react-parallax-tilt`) directly on the client
- 🧠 Decorator-based syntax for organizing views
- 🎯 TypeScript-first design with inferred props and module support
- 🧩 Works with `res.render()` and native Express/Nest views
- 💻 No client-side build system required — pure Node runtime

---

## 📦 Installation

Install via npm or yarn:

```bash
npm install @damian88/nestjsx
```
Or clone my boiler plate
```bash
npm pack @damian88/nestjsx-example && mkdir -p examples/nestjsx && tar -xzf $(ls *.tgz) -C examples/nestjsx --strip-components=1 && rm $(ls *.tgz)
```


## ⚙️ Setup
Update your tsconfig
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ESNext",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "forceConsistentCasingInFileNames": true,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "noFallthroughCasesInSwitch": false,
    "paths": {
      "@/*": ["src/views/*"],
    }
  },
  "include": ["src/**/*"]
}

```
In your nest server add the following to your main.ts

```ts
import  NestReactEngine from '@damian88/nestjsx';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  NestReactEngine(app);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

```
you can now use `res.render("templateName",{props})` to render a tsx template as "src/views/${templateName}".tsx, or you can use built in nest functions to render a template:
```tsx
import { Controller, Get, Post, Render, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

@Controller()
export class ApiController {
	@Get('/')
	@Render("home")
	Home(@Req() req: Request, @Res() res: Response) {
		return { hello: 'who are you?' }
	}
}
```

## Template Tools
```tsx
import { Use, Server, Render, Client, Component } from '@damian88/nestjsx';
```


#### ⚙️ Server & Render

Using @Server class defines the server side template, You will get passed The client side components difined in @client
```tsx
@Server()
class $ {
	@Render() async render({ Client }: { Client: ClientSide }) {
		return (
			<html>
				<head>
					<title>Test</title>
				</head>
				<body>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							gap: '4rem',
						}}
					>
                        {/*Render client side components*/}
						<Client.Header test="Header Test" />
						<Client.Home test="Home Test" />
						<Client.Footer test="Footer Test" />
					</div>
				</body>
			</html>
		);
	}
}

```
#### 💻 Client
@Client is used to define client side components, Components defined here will be passed to the server in an Object as seen in the example above.
```tsx
@Client()
@Use({
	//...modules
})
class ClientSide {
	///...components
}
```
#### 🧩 Component
@Component is used to difine a client side component, works like `@Component(containerElementType:string) Callback(props:any){return<></>}`
```tsx
class ClientSide {
	@Component('footer') Footer(props: { test: string }) {
		return <>Footer says: {props.test}</>;
	}
}
```
#### 📦 Use

You can pass third-party React libraries to the client using the @Use() decorator.

```tsx
//Import modules for type declarations
import React from 'react';
import * as Tilt from 'react-parallax-tilt';

@Client
@Use({
  React: 'react',
  MyUI: 'my-ui-lib',
  Tilt: 'react-parallax-tilt',
})class Callback{}
```

Then use them in any @Component(containerElementType:string) like this, you might need to use .default:
```tsx
@Client
@Use({
  React: 'react',
  MyUI: 'my-ui-lib',
  Tilt: 'react-parallax-tilt',
})class ClientSide {
	@Component('footer') Footer(props: { test: string }) {
		return <>
		<MyUI.Button>Click Me</MyUI.Button>
		<Tilt.default>Fancy Tilt Box</Tilt.default>
		</>
	}
}
```
## Example views

```tsx
import { Server, Render, Client, Component, Use } from 'nestjsx';

@Server()
class $ {
  @Render()
  render({ Client }: { Client: ClientSide }) {
    return (
      <html>
        <head>
          <title>Welcome</title>
        </head>
        <body>
          <h1>Hello from the server!</h1>
          <Client.Greeting name="Damian" />
        </body>
      </html>
    );
  }
}

@Client()
@Use({ React: 'react' })
class ClientSide {
  @Component('div') Greeting(props: { name: string }) {
    return <p>Welcome, {props.name}! 🎉</p>;
  }
}
```
```tsx
@Server()
class $ {
  async fetchData() {
    // Simulate async data fetching
    return new Promise<string>((res) => setTimeout(() => res('Server Data'), 100));
  }

  @Render()
  async render({ Client }: { Client: ClientSide }) {
    const data = await this.fetchData();
    return (
      <html>
        <head>
          <title>Dynamic Page</title>
        </head>
        <body>
          <Client.Loader text={data} />
        </body>
      </html>
    );
  }
}

@Client()
@Use({ React: 'react' })
class ClientSide {
  @Component('section') Loader(props: { text: string }) {
    const [loaded, setLoaded] = React.useState(false);

    React.useEffect(() => {
      setTimeout(() => setLoaded(true), 1000);
    }, []);

    return <>{loaded ? <strong>{props.text}</strong> : 'Loading...'}</>;
  }
}
```
```tsx
@Server()
class $ {
  @Render()
  render({ Client }: { Client: ClientSide }) {
    return (
      <html>
        <head>
          <title>Navigation Example</title>
        </head>
        <body>
          <nav>
            <a href="/">Home</a> | <a href="/about">About</a>
          </nav>
          <Client.Page name="Home" />
        </body>
      </html>
    );
  }
}

@Client()
@Use({ React: 'react' })
class ClientSide {
  @Component('main') Page(props: { name: string }) {
    return <h2>This is the {props.name} page</h2>;
  }
}
```
```tsx
@Server()
class $ {
  @Render()
  render({ Client }: { Client: ClientSide }) {
    return (
      <html>
        <head>
          <title>Form Example</title>
        </head>
        <body>
          <h1>Contact Us</h1>
          <Client.Form />
        </body>
      </html>
    );
  }
}

@Client()
@Use({ React: 'react' })
class ClientSide {
  @Component('form') Form() {
    const [value, setValue] = React.useState('');
    const [submitted, setSubmitted] = React.useState(false);

    return (
      <>
        <input
          type="text"
          value={value}
          placeholder="Your name"
          onChange={(e) => setValue(e.target.value)}
        />
        <button
          type="button"
          onClick={() => {
            setSubmitted(true);
          }}
        >
          Submit
        </button>
        {submitted && <p>Thanks, {value}!</p>}
      </>
    );
  }
}
```