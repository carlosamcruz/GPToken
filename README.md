# General Purpose (Fungible) Token - GPToken

This is a general purpose token project a fungible token with 9 functions;

# To Set the Project Up:

The following instructions will help you to setup the project from the current repo:

   ```
	Clone Repository:

		git clone https://github.com/carlosamcruz/GPToken
		cd GPToken

	Create a new React Project:

		npx create-react-app webgptoken --template typescript
		cd webgptoken
		npx scrypt-cli@latest init

			***In case its necessary apply the following commands:

			git init
			git add .
			git commit -m "Initialize project using Creat React App"
			npx scrypt-cli@latest init

	***Install: (Not Necessary for this version)

		npm install scrypt-ts-lib		//https://github.com/sCrypt-Inc/scrypt-ts-lib

	Delete from node_mudules folders:

		..\node_modules\bsv
		..\node_modules\scrypt-ts
		..\node_modules\node-polyfill-webpack-plugin   

	Copy from crack_scrypt_0.1.73 foder (in this repo)

		..\crack_scrypt_0.1.73\bsv
		..\crack_scrypt_0.1.73\scrypt-ts
		..\crack_scrypt_0.1.73\node-polyfill-webpack-plugin
		..\crack_scrypt_0.1.73\filter-obj   
  
	Paste the four folders above into node_modules

		..\node_modules\bsv
		..\node_modules\scrypt-ts
		..\node_modules\node-polyfill-webpack-plugin
		..\node_modules\filter-obj

	Delete from projeto folder webgptoken:

		..\webgptoken\src

	Copy folder (in this repo):

		src

	Paste it into project folder:

		..\webgptoken\src   

	Compile the Project Contracts:

		npx scrypt-cli@latest compile

	Run it in your pc:

		npm start   

   ```

"# General Purpose (Fungible) Token - GPToken" 
