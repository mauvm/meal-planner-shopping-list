import { DependencyContainer, isValueProvider } from 'tsyringe'

/**
 * Clear tsyringe container instances
 *
 * We need a clean state per test,
 * otherwise changes or stubs could interfere with other tests.
 *
 * @todo Replace with container.clearInstances() once implemented
 * @see https://github.com/microsoft/tsyringe/issues/83
 */
export default function clearContainerInstances(
  container: DependencyContainer,
): void {
  const registry = (container as any)._registry

  for (const [token, registrations] of registry.entries()) {
    registry.setAll(
      token,
      registrations
        // Clear registrations from container.registerInstance() calls
        .filter((registration: any) => !isValueProvider(registration.provider))
        // Clear instances
        .map((registration: any) => {
          registration.instance = undefined
          return registration
        }),
    )
  }
}
