import mongoose from "mongoose";
import dotenv from "dotenv";
import LearningPath from "./src/models/LearningPath.js";

dotenv.config();

const markdownNotes = `
# System Design Mastery (Premium)

Welcome to the ultimate System Design guide. This course covers everything you need to know to ace senior engineering interviews.

## 1. Introduction to System Design

System design is the process of defining the architecture, components, modules, interfaces, and data for a system to satisfy specified requirements.

### Key Characteristics of Distributed Systems
- **Scalability**: Capability to grow and manage increased demand.
- **Reliability**: Probability a system will fail in a given period.
- **Availability**: Time a system remains operational to perform its required function in a specific period.
- **Efficiency**: Two standard measures: latency (response time) and throughput (number of requests).

## 2. Load Balancing

A load balancer distributes incoming client requests across a group of servers (a server farm or server pool).
- **Hardware Load Balancers**: Very fast but expensive.
- **Software Load Balancers**: HAProxy, Nginx. Less expensive, more flexible.

### Routing Methods
- Round Robin
- Least Connections
- IP Hash

## 3. Caching

Caches take advantage of the locality of reference principle: recently requested data is likely to be requested again.
- **Application server cache**: Caching directly on a request layer node.
- **Content Distribution Network (CDN)**: Caches static media.
- **Global caches**: A single cache space for all nodes. Redis or Memcached.

### Cache Invalidation
- Write-through cache
- Write-around cache
- Write-back cache

## 4. Databases

### Relational Databases (SQL)
- ACID compliance (Atomicity, Consistency, Isolation, Durability)
- Examples: MySQL, PostgreSQL
- Best for: Structured data, strict relationships.

### Non-Relational Databases (NoSQL)
- BASE properties (Basically Available, Soft state, Eventual consistency)
- Key-Value stores (Redis)
- Document stores (MongoDB)
- Wide-Column stores (Cassandra)
- Graph stores (Neo4j)

## 5. CAP Theorem
It is impossible for a distributed data store to simultaneously provide more than two out of the following three guarantees:
1. **Consistency** (C)
2. **Availability** (A)
3. **Partition Tolerance** (P)

*Networks aren't reliable, so you'll need to support partition tolerance. Thus, you must choose between Consistency and Availability.*

---

*End of sample preview.*
`;

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const newPath = new LearningPath({
      id: "premium-system-design-notes",
      title: "Top 50 System Design Notes (Pro)",
      description: "Master system design with these comprehensive notes on distributed systems.",
      level: "Advanced",
      estimatedTime: "20 hours",
      color: "#f59e0b",
      icon: "Server",
      isPro: true,
      contentType: "notes",
      content: markdownNotes,
      modules: []
    });

    await newPath.save();
    console.log("Premium System Design Notes created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding notes:", error);
    process.exit(1);
  }
};

seed();
