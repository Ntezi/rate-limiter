# Rate Limiter Service

The Rate Limiter Service is designed to limit the rate of incoming requests from clients, protecting your backend services from being overwhelmed by excessive traffic. It implements a combination of the Sliding Window Log algorithm, API quotas, and adaptive rate limiting strategies to provide fine-grained control over the request rate.

## Features

### Sliding Window Log Algorithm

The Sliding Window Log algorithm allows you to limit requests per second, providing a smooth distribution of requests. It uses a time-based sliding window to track incoming requests and ensures that the allowed request rate is maintained within the specified time frame.

### API Quotas

API quotas enable you to assign each client a fixed number of requests per month. If a client exceeds their quota, their requests will be throttled until the quota resets at the beginning of the next month. This helps to prevent excessive usage of your API by individual clients.

### Adaptive Rate Limiting

Adaptive rate limiting adjusts the rate limit based on factors such as server load or user behavior. This helps maintain system performance under high traffic conditions, dynamically adapting the allowed request rate as needed.

### Soft and Hard Throttling

The service also supports soft and hard throttling:

- Soft throttling: Clients are informed that they are approaching their rate limit, but their requests are still processed. This allows them to adjust their usage pattern before reaching the hard limit.
- Hard throttling: Requests from clients that exceed their rate limit are blocked until the limit is reset or the client's behavior changes.

## Implementation

The Rate Limiter Service is implemented as a middleware for Node.js and TypeScript applications. It can be easily integrated into your existing API Gateway or used as a standalone service.

To use the Rate Limiter Service, simply import the `RateLimiterMiddleware` class and add it to your application's middleware stack. You can configure the service using various options, such as the sliding window rate limit, API quota limit, and adaptive rate limit threshold and multiplier.

For detailed usage instructions and example code, please refer to the [Usage](#usage) section below.


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

# Author

[Marius Ngaboyamahina](https://ntezi.github.io/) - Initial work and development of the Rate Limiter Service. Feel free to reach out if you have any questions or suggestions for improvements.

You can also add a list of contributors if other people have contributed to the project.



