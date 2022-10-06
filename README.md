![prisma-axiom: The official Prisma integration for Axiom](.github/images/banner-dark.svg#gh-dark-mode-only)
![prisma-axiom: The official Prisma integration for Axiom](.github/images/banner-light.svg#gh-light-mode-only)

<div align="center">

[![Workflow][workflow_badge]][workflow]
[![Latest Release][release_badge]][release]
[![License][license_badge]][license]

</div>

[Axiom](https://axiom.co) unlocks observability at any scale.

- **Ingest with ease, store without limits:** Axiom’s next-generation datastore enables ingesting petabytes of data with ultimate efficiency. Ship logs from Kubernetes, AWS, Azure, Google Cloud, DigitalOcean, Nomad, and others.
- **Query everything, all the time:** Whether DevOps, SecOps, or EverythingOps, query all your data no matter its age. No provisioning, no moving data from cold/archive to “hot”, and no worrying about slow queries. All your data, all. the. time.
- **Powerful dashboards, for continuous observability:** Build dashboards to collect related queries and present information that’s quick and easy to digest for you and your team. Dashboards can be kept private or shared with others, and are the perfect way to bring together data from different sources

For more information check out the [official documentation](https://axiom.co/docs).

## Usage

Install prisma-axiom

```shell
npm install --save prisma-axiom
```

If you use the [Axiom CLI](https://github.com/axiomhq/cli), run `eval $(axiom config export -f)` to configure your environment variables.

Otherwise create a personal token in [the Axiom settings](https://cloud.axiom.co/settings/profile) and export it as `AXIOM_TOKEN`. Set `AXIOM_ORG_ID` to the organization ID from the settings page of the organization you want to access.

Wrap your main functions in `withAxiom` to automatically set up telemetry and 
flush traces before exit:

```ts
import withAxiom from 'prisma-axiom';
const prisma = new PrismaClient();

async function main() {
  // do something with prisma
}

withAxiom(main)() // wrap function 
```

Enable the prisma tracing preview feature in `schema.prisma` like this:

```js
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["tracing"]
}
```

For further examples, head over to the [examples](examples) directory.

## License

Distributed under the [MIT License](LICENSE).

<!-- Badges -->

[workflow]: https://github.com/axiomhq/prisma-axiom/actions/workflows/push.yml
[workflow_badge]: https://img.shields.io/github/workflow/status/axiomhq/prisma-axiom/CI?ghcache=unused
[release]: https://github.com/axiomhq/prisma-axiom/releases/latest
[release_badge]: https://img.shields.io/github/release/axiomhq/prisma-axiom.svg?ghcache=unused
[license]: https://opensource.org/licenses/MIT
[license_badge]: https://img.shields.io/github/license/axiomhq/prisma-axiom.svg?color=blue&ghcache=unused