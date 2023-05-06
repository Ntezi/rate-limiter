# Rate Limiter Service

A Node.js and TypeScript implementation of a rate limiter middleware for Express applications. The rate limiting is
achieved using a combination of the Sliding Window Log algorithm, API Quotas, and Adaptive Rate Limiting.

## Features

- Sliding Window Log algorithm for rate limiting requests within the same time window
- API Quotas for rate limiting requests on a per-month basis
- Adaptive Rate Limiting for handling too many requests across the entire system
- Soft and Hard throttling for more efficient and user-friendly rate limiting

## Installation

1. Clone the repository:

```bash
git clone git clone https://github.com/Ntezi/rate-limiter.git
```

2. Navigate to the project directory:

```bash
cd rate-limiter
```

3. Install the dependencies:

```bash
yarn install
```

4. Start the server:

```bash
docker-compose up --build
```

## Usage

You can use the following endpoints to test the rate limiter:
http://localhost:2305/rate-limiter

## Testing

### Install wrk

#### macOS

You can install `wrk` using Homebrew:
    
```bash
brew install wrk
```


#### Ubuntu/Debian

For Ubuntu/Debian-based systems, you can install `wrk` by compiling it from the source:

```bash
sudo apt-get install build-essential libssl-dev git -y
git clone https://github.com/wg/wrk.git
cd wrk
make
sudo cp wrk /usr/local/bin
``` 

#### CentOS/RHEL

For CentOS/RHEL-based systems, you can install `wrk` by compiling it from the source:

```bash
sudo yum groupinstall -y "Development Tools"
sudo yum install -y openssl-devel git
git clone https://github.com/wg/wrk.git
cd wrk
make
sudo cp wrk /usr/local/bin
```

#### Windows

For Windows, you can download a precompiled binary from [this repository](https://github.com/maierhofer/wrk-windows). Download the `wrk.exe` file and add it to your system's PATH.


### Load testing with `wrk`

Install `wrk` following the instructions on the [official repository](https://github.com/wg/wrk).

Use `wrk` to benchmark your Rate Limiter Service:

```bash
wrk -t12 -c400 -d30s http://localhost:2305/rate-limiter
```




