# Churro: Empowering the Next Generation of Earners

## Inspiration
As teens ourselves, we wanted to earn our own money, but we quickly realized that traditional employment in high school is broken. Getting an actual job is often unfeasible due to the rigid time commitments of school, extracurriculars, and being a student. On the other hand, "neighborhood hustle" like mowing lawns or pet sitting is great, but it lacks reach and structure. It’s hard to find new "clients" beyond your immediate neighbors, and safety is a massive concern when meeting strangers. We built Churro to solve this: a structured, safe, and flexible marketplace that turns neighborhood chores into a professional stepping stone.

## What it does
Churro is a specialized three-sided marketplace designed with safety as its first priority:
* **For Teens:** Browse local tasks on an interactive map (pet sitting, tutoring, yard work) and build a digital resume of verified reviews.
* **For Neighbors:** Post tasks for local help, and connect with motivated teens for affordable neighborhood assistance.
* **For Parents:** Access a dedicated **Parent Dashboard** to approve task applications, monitor their teen's live progress (e.g. heading there, arrived, done), and track their rewards securely.

## How we built it
We built Churro using a modern, scalable stack focused on real-time interaction and secure role-based data relationships:
* **Frontend:** Built with **React (Vite)** and **Tailwind CSS** for a responsive, intuitive, and dynamic experience that works flawlessly across devices.
* **Authentication:** Integrated **Firebase Authentication** handling Google OAuth flows to securely manage our three distinct user roles (Teen, Parent, Neighbor).
* **Database & Backend:** Utilized **Firebase Firestore** with robust, transaction-based **Security Rules** to manage the relational links between parents and teens.
* **State & Real-Time Sync:** Leveraged native **Firestore onSnapshot** listeners along with custom hooks (`useAuth`, `useTasks`) to push real-time task statuses, map updates, and notifications universally across the three distinct dashboards without polling.

## Challenges we ran into
The most significant challenge was the **Permissions Architecture**. Unlike a standard two-party marketplace (Buyer/Seller), Churro requires a strict "Triangle of Trust." 
We had to engineer complex **Firestore Security Rules** enforcing that teens could not view neighbor addresses or start a job until a parent fully approved it. Structuring these Firestore rules to block invalid queries entirely—while allowing the dashboard maps to filter properly by age and approved categories—was a complex balancing act of security and UX design.

## Accomplishments that we're proud of
We are incredibly proud of our **Advanced Safety Filtering Logic**:
1. **Dynamic Age-Gating & Curfews:** Our custom JavaScript calendar and age-filtering algorithm dynamically hides dangerous tasks (like using power tools) from teens under 16, and automatically restricts task visibility based on sundown curfews (which adapt for daylight saving and summer break months)!
2. **Community Trust System:** We implemented a secure, atomic transaction rolling-average rating algorithm that automatically guards against client-side exploitation while dynamically maintaining robust trust scores for both neighbors and teens:

$$T_{new} = \frac{(T_{current} \times n) + R}{n + 1}$$

Where:
* $R$ is the newly submitted rating (1-5 stars)
* $T_{current}$ is the user's current average rating 
* $n$ is the total number of completed tasks

This ensures that all ratings scale correctly and mathematically reward consistent, high-quality community work over time.

## What we learned
We learned that when building for minors, **"Security is a Feature."** While many consumer apps try to completely eliminate friction, we found that adding intentional, role-based friction—like requiring a parental sign-off before a teenager can accept a task—dramatically increased trust. We also deepened our database architecture skills significantly by linking dependencies securely across three disjointed user types inside NoSQL structures via Cloud Functions.

## What's next for Churro
* **Churro Academy:** Mini-modules on financial literacy and professional communication.
* **Skill Badges:** Verifiable credentials for skills like "First Aid Certified" or "Advanced Lawn Maintenance."
* **Direct Payouts:** Migrating away from our current MVP pseudo-balance rewards by integrating specialized banking APIs (like Stripe or Greenlight) to help seamlessly push real funds directly into teenagers' debit balances.