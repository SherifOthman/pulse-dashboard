export type GovernorateDto = { id: string; name: string }
export type CityDto = { id: string; name: string; governorateId: string }

export type CreateCityDto = { name: string; governorateId: string }
export type UpdateCityDto = Partial<CreateCityDto>

export type CreateGovernorateDto = { name: string }
export type UpdateGovernorateDto = Partial<CreateGovernorateDto>
