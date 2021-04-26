# devops-with-kubernetes

## 3.06 DBaas vs DIY

#### DBaas PROS

- DBaas service providers often offer multiple features that remedy pain points that DBA's face often.
  - These include (but are not limited to: installation, configuration, volume provision, hardware and network setup, taking care of backups etc.).
- High availability guarantees ("High availability" on wikipedia)
- Possibility of on-demand pricing (per usage)
- Feasible for teams with low funds / no sysadmins etc.
- Easy to get started --> Easier to push out an MVP / Prototype
- Primary advantages would likely be in the value of resource-to-manpower ratio. It is an affordable solution for smaller to mid-sized companies (atleast).

#### DIY PROS

- Easier to work with custom extensions and functions that are project-specific
- No vendor Lock-in
- Storing legally sensitive data in a way DBaas service providers are unable to
- Once a business reaches a certain size, it becomes more economical to build own database (issues of cost-at-scale)
- Primary advantage would likely be in the matter of control. This approach has the direct access to the servers that are running the database

## 3.07

#### Using Postgres with PersistentVolumeClaims

- Because it sounded easier
- Biased answer since we've already got the postgres setup in place
- Wanting to go outside vendor lock-in problems after running into them in earlier Firebase projects

## 3.08 & 3.09

#### Resource limits

Set same (low-ish?) values for each container after seeing that the workload monitor charts
were well within the limits. The memory usage is hovering between 60-75% constantly.

Values set

- 100m for CPU
- 50Mi for memory

Horizontal pod autoscaler is fairly conservative as it allows for exactly 1 replica and 25% target CPU utilization. The target percentage could be lowered still as the usage percentage is in the single digits.
