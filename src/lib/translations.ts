export type Locale = "en" | "ar";

export type TranslationKey =
  | "meta.title"
  | "meta.description"
  | "meta.ogTitle"
  | "meta.ogDescription"
  | "meta.ogImageAlt"
  | "meta.ogFeaturesImageAlt"
  | "nav.dashboard"
  | "nav.healthLogs"
  | "nav.resources"
  | "nav.profile"  | "nav.toolkit"

  | "nav.backToDashboard"
  | "nav.doctorHub"
  | "nav.consultations"
  | "nav.upgradePro"
  | "nav.language"
  | "nav.switchToArabic"
  | "nav.switchToEnglish"
  | "nav.breadcrumb"
  | "nav.goBack"
  | "nav.mainMenu"
  | "nav.primaryNav"
  | "consultationsHub.title"
  | "consultationsHub.subtitle"
  | "consultationsHub.viewAllThreads"
  | "consultationsHub.intakeTitle"
  | "consultationsHub.intakeDescription"
  | "consultationsHub.persistOption"
  | "consultationsHub.processing"
  | "consultationsHub.structureAction"
  | "consultationsHub.copy"
  | "consultationsHub.intakeFailed"
  | "consultationsHub.briefDescription"
  | "consultationsHub.briefLoading"
  | "consultationsHub.briefEmpty"
  | "consultationsHub.messagingTitle"
  | "consultationsHub.messagingDescription"
  | "consultationsHub.loadingThreads"
  | "consultationsHub.sendFailed"
  | "consultationsHub.severitySlider"
  | "consultationsHub.reviewShareTitle"
  | "consultationsHub.logToRecordOption"
  | "consultationsHub.shareThreadLabel"
  | "consultationsHub.shareThreadPlaceholder"
  | "consultationsHub.submitAction"
  | "consultationsHub.submitting"
  | "consultationsHub.submitFailed"
  | "consultationsHub.loggedPart"
  | "consultationsHub.sentPart"
  | "auth.login.title"
  | "auth.login.description"
  | "header.themeLight"
  | "header.themeDark"
  | "ai.statusLabel"
  | "ai.checking"
  | "ai.live"
  | "ai.mock"
  | "ai.offline"
  | "common.save"
  | "common.cancel"
  | "common.loading"
  | "common.readMore"
  | "common.back"
  | "common.signInRequired"
  | "resources.title"
  | "resources.subtitle"
  | "resources.search"
  | "resources.all"
  | "resources.about"
  | "resources.diagnosis"
  | "resources.treatment"
  | "resources.nutrition"
  | "resources.exercises"
  | "resources.faq"
  | "resources.community"
  | "resources.filterAria"
  | "resources.category.all"
  | "resources.category.managingFlares"
  | "resources.category.nutritionHydration"
  | "resources.category.gentleMovement"
  | "resources.category.mentalSupport"
  | "resources.tipsFor"
  | "resources.card.flarePacing.title"
  | "resources.card.flarePacing.description"
  | "resources.card.flarePacing.tip1"
  | "resources.card.flarePacing.tip2"
  | "resources.card.flarePacing.tip3"
  | "resources.card.flarePacing.tip4"
  | "resources.card.flareHeat.title"
  | "resources.card.flareHeat.description"
  | "resources.card.flareHeat.tip1"
  | "resources.card.flareHeat.tip2"
  | "resources.card.flareHeat.tip3"
  | "resources.card.flareHeat.tip4"
  | "resources.card.antiInflammatory.title"
  | "resources.card.antiInflammatory.description"
  | "resources.card.antiInflammatory.tip1"
  | "resources.card.antiInflammatory.tip2"
  | "resources.card.antiInflammatory.tip3"
  | "resources.card.antiInflammatory.tip4"
  | "resources.card.hydration.title"
  | "resources.card.hydration.description"
  | "resources.card.hydration.tip1"
  | "resources.card.hydration.tip2"
  | "resources.card.hydration.tip3"
  | "resources.card.hydration.tip4"
  | "resources.card.stretching.title"
  | "resources.card.stretching.description"
  | "resources.card.stretching.tip1"
  | "resources.card.stretching.tip2"
  | "resources.card.stretching.tip3"
  | "resources.card.stretching.tip4"
  | "resources.card.walking.title"
  | "resources.card.walking.description"
  | "resources.card.walking.tip1"
  | "resources.card.walking.tip2"
  | "resources.card.walking.tip3"
  | "resources.card.walking.tip4"
  | "resources.card.mindfulness.title"
  | "resources.card.mindfulness.description"
  | "resources.card.mindfulness.tip1"
  | "resources.card.mindfulness.tip2"
  | "resources.card.mindfulness.tip3"
  | "resources.card.mindfulness.tip4"
  | "resources.card.sleepHygiene.title"
  | "resources.card.sleepHygiene.description"
  | "resources.card.sleepHygiene.tip1"
  | "resources.card.sleepHygiene.tip2"
  | "resources.card.sleepHygiene.tip3"
  | "resources.card.sleepHygiene.tip4"
  | "resources.card.breathwork.title"
  | "resources.card.breathwork.description"
  | "resources.card.breathwork.tip1"
  | "resources.card.breathwork.tip2"
  | "resources.card.breathwork.tip3"
  | "resources.card.audioTherapy.title"
  | "resources.card.audioTherapy.description"
  | "resources.card.audioTherapy.tip1"
  | "resources.card.audioTherapy.tip2"
  | "resources.card.audioTherapy.tip3"
  | "resources.card.flarePacing.summary.1"
  | "resources.card.flarePacing.summary.2"
  | "resources.card.flarePacing.summary.3"
  | "resources.card.flareHeat.summary.1"
  | "resources.card.flareHeat.summary.2"
  | "resources.card.flareHeat.summary.3"
  | "resources.card.antiInflammatory.summary.1"
  | "resources.card.antiInflammatory.summary.2"
  | "resources.card.antiInflammatory.summary.3"
  | "resources.card.hydration.summary.1"
  | "resources.card.hydration.summary.2"
  | "resources.card.hydration.summary.3"
  | "resources.card.stretching.summary.1"
  | "resources.card.stretching.summary.2"
  | "resources.card.stretching.summary.3"
  | "resources.card.walking.summary.1"
  | "resources.card.walking.summary.2"
  | "resources.card.walking.summary.3"
  | "resources.card.mindfulness.summary.1"
  | "resources.card.mindfulness.summary.2"
  | "resources.card.mindfulness.summary.3"
  | "resources.card.sleepHygiene.summary.1"
  | "resources.card.sleepHygiene.summary.2"
  | "resources.card.sleepHygiene.summary.3"
  | "resources.card.breathwork.summary.1"
  | "resources.card.breathwork.summary.2"
  | "resources.card.breathwork.summary.3"
  | "resources.card.audioTherapy.summary.1"
  | "resources.card.audioTherapy.summary.2"
  | "resources.card.audioTherapy.summary.3"
  | "resources.ai.summaryTitle"
  | "resources.ai.toggle"
  | "resources.ai.hide"
  | "resources.ai.verified"
  | "resources.ai.guidelineLabel"
  | "resources.ai.titleLabel"
  | "resources.ai.originLabel"
  | "resources.ai.summaryLabel"
  | "resources.ai.viewGuideline"
  | "resources.ai.unverified"
  | "resources.ai.unverifiedNote"
  | "resources.ai.foggy"
  | "resources.ai.standard"
  | "resources.plan.title"
  | "resources.plan.subtitle"
  | "resources.plan.create"
  | "resources.plan.rebuild"
  | "resources.plan.step"
  | "resources.plan.basedOn"
  | "resources.plan.step.rest.title"
  | "resources.plan.step.rest.detail"
  | "resources.plan.step.heat.title"
  | "resources.plan.step.heat.detail"
  | "resources.plan.step.breathe.title"
  | "resources.plan.step.breathe.detail"
  | "resources.plan.step.pace.title"
  | "resources.plan.step.pace.detail"
  | "resources.plan.step.environment.title"
  | "resources.plan.step.environment.detail"
  | "resources.plan.step.hydrate.title"
  | "resources.plan.step.hydrate.detail"
  | "resources.plan.step.resume.title"
  | "resources.plan.step.resume.detail"
  | "resources.plan.step.care.title"
  | "resources.plan.step.care.detail"
  | "resources.bodyMap.title"
  | "resources.bodyMap.subtitle"
  | "resources.bodyMap.part.neck"
  | "resources.bodyMap.part.shoulders"
  | "resources.bodyMap.part.lowerBack"
  | "resources.bodyMap.part.hips"
  | "resources.bodyMap.part.knees"
  | "resources.bodyMap.part.joints"
  | "resources.bodyMap.clear"
  | "resources.bodyMap.heatHint"
  | "resources.bodyMap.movementHint"
  | "resources.bodyMap.rotateHint"
  | "resources.bodyMap.tapHint"
  | "resources.semantic.matched"
  | "resources.semantic.clear"
  | "resources.effort.low"
  | "resources.effort.medium"
  | "resources.painAware.banner"
  | "resources.painAware.highPain"
  | "resources.empty"
  | "resources.feed.title"
  | "resources.feed.subtitle"
  | "resources.feed.refresh"
  | "resources.feed.refreshing"
  | "resources.feed.live"
  | "resources.feed.offline"
  | "about.title"
  | "about.subtitle"
  | "about.overview"
  | "about.causes"
  | "about.symptoms"
  | "about.causesDetail"
  | "about.symptomsDetail"
  | "about.overviewContent"
  | "about.overviewPlain"
  | "about.causesPlain"
  | "about.symptomsPlain"
  | "about.highlight.prevalence.label"
  | "about.highlight.prevalence.value"
  | "about.highlight.pain.label"
  | "about.highlight.pain.value"
  | "about.highlight.management.label"
  | "about.highlight.management.value"
  | "about.symptom.pain.label"
  | "about.symptom.pain.value"
  | "about.symptom.fatigue.label"
  | "about.symptom.fatigue.value"
  | "about.symptom.fog.label"
  | "about.symptom.fog.value"
  | "about.symptom.sleep.label"
  | "about.symptom.sleep.value"
  | "about.symptom.headache.label"
  | "about.symptom.headache.value"
  | "about.symptom.sensitivity.label"
  | "about.symptom.sensitivity.value"
  | "about.symptom.stiffness.label"
  | "about.symptom.stiffness.value"
  | "about.symptom.digestive.label"
  | "about.symptom.digestive.value"
  | "about.cause.amplified.title"
  | "about.cause.amplified.desc"
  | "about.cause.genetic.title"
  | "about.cause.genetic.desc"
  | "about.cause.trauma.title"
  | "about.cause.trauma.desc"
  | "about.cause.sleep.title"
  | "about.cause.sleep.desc"
  | "about.cause.infection.title"
  | "about.cause.infection.desc"
  | "about.causesIntro"
  | "about.symptomsIntro"
  | "about.gutBrain.title"
  | "about.gutBrain.intro"
  | "about.gutBrain.detail"
  | "about.gut.node.brain"
  | "about.gut.node.brainHint"
  | "about.gut.node.vagus"
  | "about.gut.node.vagusHint"
  | "about.gut.node.gut"
  | "about.gut.node.gutHint"
  | "about.gut.node.symptoms"
  | "about.gut.node.symptomsHint"
  | "about.gut.tip.bloating"
  | "about.gut.tip.motility"
  | "about.gut.tip.stress"
  | "about.gut.tip.microbiome"
  | "about.weatherSensitivity.title"
  | "about.weatherSensitivity.eyebrow"
  | "about.weatherSensitivity.intro"
  | "about.weatherSensitivity.tip.heat"
  | "about.weatherSensitivity.tip.cold"
  | "about.weatherSensitivity.tip.pressure"
  | "about.weatherSensitivity.tip.transition"
  | "about.visual.eyebrow"
  | "about.visual.symptoms.caption"
  | "about.visual.gutBrain.eyebrow"
  | "diagnosis.title"
  | "diagnosis.subtitle"
  | "diagnosis.howDiagnosed"
  | "diagnosis.tests"
  | "diagnosis.specialist"
  | "diagnosis.criteria"
  | "diagnosis.exams"
  | "diagnosis.criteriaPlain"
  | "diagnosis.examsPlain"
  | "diagnosis.specialistDetail"
  | "diagnosis.specialistPlain"
  | "diagnosis.criteria.wpi.label"
  | "diagnosis.criteria.wpi.value"
  | "diagnosis.criteria.sss.label"
  | "diagnosis.criteria.sss.value"
  | "diagnosis.criteria.duration.label"
  | "diagnosis.criteria.duration.value"
  | "diagnosis.criteria.exclusion.label"
  | "diagnosis.criteria.exclusion.value"
  | "diagnosis.exam.cbc.label"
  | "diagnosis.exam.cbc.value"
  | "diagnosis.exam.esr.label"
  | "diagnosis.exam.esr.value"
  | "diagnosis.exam.thyroid.label"
  | "diagnosis.exam.thyroid.value"
  | "diagnosis.exam.vitaminD.label"
  | "diagnosis.exam.vitaminD.value"
  | "diagnosis.exam.rheumatoid.label"
  | "diagnosis.exam.rheumatoid.value"
  | "diagnosis.exam.sleep.label"
  | "diagnosis.exam.sleep.value"
  | "diagnosis.specialistHighlight.1"
  | "diagnosis.specialistHighlight.2"
  | "diagnosis.specialistHighlight.3"
  | "resources.takeaway.title"
  | "resources.takeaway.subtitle"
  | "resources.takeaway.open"
  | "resources.takeaway.close"
  | "resources.takeaway.about.1"
  | "resources.takeaway.about.2"
  | "resources.takeaway.about.3"
  | "resources.takeaway.diagnosis.1"
  | "resources.takeaway.diagnosis.2"
  | "resources.takeaway.diagnosis.3"
  | "resources.takeaway.treatment.1"
  | "resources.takeaway.treatment.2"
  | "resources.takeaway.treatment.3"
  | "resources.takeaway.nutrition.1"
  | "resources.takeaway.nutrition.2"
  | "resources.takeaway.nutrition.3"
  | "resources.takeaway.exercises.1"
  | "resources.takeaway.exercises.2"
  | "resources.takeaway.exercises.3"
  | "resources.takeaway.faq.1"
  | "resources.takeaway.faq.2"
  | "resources.takeaway.faq.3"
  | "resources.takeaway.community.1"
  | "resources.takeaway.community.2"
  | "resources.takeaway.community.3"
  | "resources.takeaway.cycle.1"
  | "resources.takeaway.cycle.2"
  | "resources.takeaway.cycle.3"
  | "resources.cycle"
  | "cycle.title"
  | "cycle.subtitle"
  | "cycle.eyebrow"
  | "cycle.intro"
  | "cycle.mechanism.title"
  | "cycle.mechanism.body"
  | "cycle.phase.menstrual"
  | "cycle.phase.menstrualSub"
  | "cycle.phase.follicular"
  | "cycle.phase.follicularSub"
  | "cycle.phase.ovulatory"
  | "cycle.phase.ovulatorySub"
  | "cycle.phase.luteal"
  | "cycle.phase.lutealSub"
  | "cycle.phase.window"
  | "cycle.phase.windowSub"
  | "cycle.forecast.title"
  | "cycle.forecast.body"
  | "cycle.forecast.badge"
  | "cycle.forecast.hint"
  | "cycle.tips.title"
  | "cycle.tip.spoons.title"
  | "cycle.tip.spoons.body"
  | "cycle.tip.heat.title"
  | "cycle.tip.heat.body"
  | "cycle.tip.nutrition.title"
  | "cycle.tip.nutrition.body"
  | "cycle.image.caption"
  | "cycle.references.title"
  | "cycle.references.disclaimer"
  | "cycle.ref.cdc"
  | "cycle.ref.cdc.detail"
  | "cycle.ref.niams"
  | "cycle.ref.niams.detail"
  | "cycle.ref.acr"
  | "cycle.ref.acr.detail"
  | "cycle.ref.cochrane"
  | "cycle.ref.cochrane.detail"
  | "cycle.overview.title"
  | "cycle.overview.content"
  | "cycle.overview.plain"
  | "cycle.tracking.title"
  | "cycle.tracking.content"
  | "cycle.tracking.plain"
  | "cycleTracker.title"
  | "cycleTracker.subtitle"
  | "cycleTracker.logCta"
  | "cycleTracker.insightLabel"
  | "cycleTracker.insightShort"
  | "cycleTracker.symptomChip.ache"
  | "cycleTracker.symptomChip.sleep"
  | "cycleTracker.symptomChip.fog"
  | "cycleTracker.symptomChip.fatigue"
  | "cycleTracker.disclaimer"
  | "cycleTracker.symptom.menstrual"
  | "cycleTracker.symptom.follicular"
  | "cycleTracker.symptom.ovulatory"
  | "cycleTracker.symptom.luteal"
  | "cycleTracker.symptom.window"
  | "cycleTracker.insight.menstrual"
  | "cycleTracker.insight.follicular"
  | "cycleTracker.insight.ovulatory"
  | "cycleTracker.insight.luteal"
  | "cycleTracker.insight.window"
  | "diagnosis.check.title"
  | "diagnosis.check.subtitle"
  | "diagnosis.check.q.widespread"
  | "diagnosis.check.q.severity"
  | "diagnosis.check.q.duration"
  | "diagnosis.check.q.exclusion"
  | "diagnosis.check.yes"
  | "diagnosis.check.no"
  | "diagnosis.check.assess"
  | "diagnosis.check.verdict.likely"
  | "diagnosis.check.verdict.possible"
  | "diagnosis.check.verdict.unlikely"
  | "diagnosis.check.criteriaLabel"
  | "diagnosis.check.summaryTitle"
  | "diagnosis.check.summary.line1"
  | "diagnosis.check.summary.line2"
  | "diagnosis.check.summary.line3"
  | "diagnosis.check.summary.line4"
  | "diagnosis.check.copy"
  | "diagnosis.check.copied"
  | "diagnosis.check.downloadPdf"
  | "diagnosis.check.disclaimer"
  | "diagnosis.check.printHint"
  | "treatment.title"
  | "treatment.subtitle"
  | "treatment.medications"
  | "treatment.therapy"
  | "treatment.exercise"
  | "treatment.stress"
  | "treatment.sleep"
  | "treatment.selfCare"
  | "treatment.medicationsContent"
  | "treatment.medicationsPlain"
  | "treatment.therapyContent"
  | "treatment.therapyPlain"
  | "treatment.exerciseContent"
  | "treatment.exercisePlain"
  | "treatment.stressContent"
  | "treatment.stressPlain"
  | "treatment.sleepContent"
  | "treatment.sleepPlain"
  | "treatment.selfCareContent"
  | "treatment.selfCarePlain"
  | "nutrition.title"
  | "nutrition.subtitle"
  | "nutrition.goodFoods"
  | "nutrition.triggers"
  | "nutrition.recipes"
  | "nutrition.hydration"
  | "nutrition.goodFoodsContent"
  | "nutrition.goodFoodsPlain"
  | "nutrition.goodFoodsHighlight.1"
  | "nutrition.goodFoodsHighlight.2"
  | "nutrition.goodFoodsHighlight.3"
  | "nutrition.triggersContent"
  | "nutrition.triggersPlain"
  | "nutrition.recipesContent"
  | "nutrition.recipesPlain"
  | "nutrition.hydrationContent"
  | "nutrition.hydrationPlain"
  | "exercises.title"
  | "exercises.subtitle"
  | "exercises.stretching"
  | "exercises.yoga"
  | "exercises.walking"
  | "exercises.swimming"
  | "exercises.tips"
  | "exercises.stretchingContent"
  | "exercises.stretchingPlain"
  | "exercises.stretchingHighlight.1"
  | "exercises.stretchingHighlight.2"
  | "exercises.stretchingHighlight.3"
  | "exercises.yogaContent"
  | "exercises.yogaPlain"
  | "exercises.walkingContent"
  | "exercises.walkingPlain"
  | "exercises.swimmingContent"
  | "exercises.swimmingPlain"
  | "exercises.tipsContent"
  | "exercises.tipsPlain"
  | "treatment.tag.meds.1"
  | "treatment.tag.meds.2"
  | "treatment.tag.therapy.1"
  | "treatment.tag.therapy.2"
  | "treatment.tag.exercise.1"
  | "treatment.tag.exercise.2"
  | "treatment.tag.stress.1"
  | "treatment.tag.stress.2"
  | "treatment.tag.sleep.1"
  | "treatment.tag.sleep.2"
  | "treatment.tag.selfCare.1"
  | "treatment.tag.selfCare.2"
  | "treatment.quickAdd.title"
  | "treatment.quickAdd.subtitle"
  | "treatment.quickAdd.added"
  | "treatment.quickAdd.error"
  | "treatment.quickAdd.signIn"
  | "treatment.quickAdd.item.pacing"
  | "treatment.quickAdd.item.rest"
  | "treatment.quickAdd.item.warm"
  | "treatment.quickAdd.item.hydration"
  | "treatment.quickAdd.item.movement"
  | "treatment.quickAdd.item.medication"
  | "nutrition.tag.goodFoods.1"
  | "nutrition.tag.goodFoods.2"
  | "nutrition.tag.triggers.1"
  | "nutrition.tag.triggers.2"
  | "nutrition.tag.recipes.1"
  | "nutrition.tag.recipes.2"
  | "nutrition.tag.hydration.1"
  | "nutrition.tag.hydration.2"
  | "nutrition.bookmark.title"
  | "nutrition.bookmark.subtitle"
  | "nutrition.bookmark.savedCount"
  | "nutrition.bookmark.food.fish"
  | "nutrition.bookmark.food.fruits"
  | "nutrition.bookmark.food.nuts"
  | "nutrition.bookmark.food.wholeGrains"
  | "nutrition.bookmark.food.fermented"
  | "nutrition.bookmark.food.oliveOil"
  | "nutrition.swap.title"
  | "nutrition.swap.subtitle"
  | "nutrition.swap.suggest"
  | "nutrition.swap.suggested"
  | "nutrition.swap.because"
  | "nutrition.swap.trigger.sugar"
  | "nutrition.swap.trigger.caffeine"
  | "nutrition.swap.trigger.alcohol"
  | "nutrition.swap.trigger.processed"
  | "nutrition.swap.trigger.sodas"
  | "nutrition.swap.item.sugar"
  | "nutrition.swap.item.caffeine"
  | "nutrition.swap.item.alcohol"
  | "nutrition.swap.item.processed"
  | "nutrition.swap.item.sodas"
  | "nutrition.swap.reason.sugar"
  | "nutrition.swap.reason.caffeine"
  | "nutrition.swap.reason.alcohol"
  | "nutrition.swap.reason.processed"
  | "nutrition.swap.reason.sodas"
  | "exercises.tag.stretching.1"
  | "exercises.tag.stretching.2"
  | "exercises.tag.yoga.1"
  | "exercises.tag.yoga.2"
  | "exercises.tag.walking.1"
  | "exercises.tag.walking.2"
  | "exercises.tag.swimming.1"
  | "exercises.tag.swimming.2"
  | "exercises.tag.tips.1"
  | "exercises.tag.tips.2"
  | "exercises.timer.start"
  | "exercises.timer.pause"
  | "exercises.timer.reset"
  | "exercises.timer.done"
  | "exercises.timer.aria"
  | "exercises.timer.spoons.one"
  | "exercises.timer.spoons.many"
  | "exercises.timer.stretchingLabel"
  | "exercises.timer.walkingLabel"
  | "stretching.intro"
  | "stretching.tipsTitle"
  | "stretching.tipsBody"
  | "stretching.neck.title"
  | "stretching.neck.steps"
  | "stretching.neck.duration"
  | "stretching.shoulder.title"
  | "stretching.shoulder.steps"
  | "stretching.shoulder.duration"
  | "stretching.lowerBack.title"
  | "stretching.lowerBack.steps"
  | "stretching.lowerBack.duration"
  | "stretching.thigh.title"
  | "stretching.thigh.steps"
  | "stretching.thigh.duration"
  | "stretching.calf.title"
  | "stretching.calf.steps"
  | "stretching.calf.duration"
  | "logging.mood.selfCare"
  | "faq.title"
  | "faq.subtitle"
  | "faq.chronic"
  | "faq.chronicAnswer"
  | "faq.cure"
  | "faq.cureAnswer"
  | "faq.pregnancy"
  | "faq.pregnancyAnswer"
  | "faq.exercise"
  | "faq.exerciseAnswer"
  | "faq.diagnosis"
  | "faq.diagnosisAnswer"
  | "faq.treatment"
  | "faq.treatmentAnswer"
  | "community.title"
  | "community.subtitle"
  | "community.shareStory"
  | "community.stories"
  | "community.tips"
  | "community.support"
  | "community.writePlaceholder"
  | "community.postButton"
  | "community.noStories"
  | "community.loginPrompt"
  | "community.samplePost.1.content"
  | "community.samplePost.1.time"
  | "community.samplePost.2.content"
  | "community.samplePost.2.time"
  | "community.samplePost.3.content"
  | "community.samplePost.3.time"
  | "community.you"
  | "community.justNow"
  | "community.reply"
  | "community.likeAria"
  | "community.filter.all"
  | "community.filter.aria"
  | "community.translate"
  | "community.translated"
  | "faq.searchPlaceholder"
  | "faq.searchAria"
  | "faq.searchClear"
  | "faq.noMatch"
  | "faq.noMatchHint"
  | "dashboard.greeting.morning"
  | "dashboard.greeting.afternoon"
  | "dashboard.greeting.evening"
  | "dashboard.todayMessage"
  | "dashboard.streakAria"
  | "dashboard.section.today"
  | "dashboard.section.core"
  | "dashboard.section.pro"
  | "dashboard.pro.title"
  | "dashboard.pro.subtitle"
  | "dashboard.pro.doctorFeed"
  | "dashboard.pro.symptomHelper"
  | "dashboard.pro.viewAll"
  | "dashboard.pro.browseDoctors"
  | "dashboard.pro.startConsultation"
  | "dashboard.pro.badgeText"
  | "dashboard.section.insights"
  | "dashboard.section.health"
  | "dashboard.toolkitCard.title"
  | "dashboard.toolkitCard.desc"
  | "dashboard.toolkitCard.cta"
  | "dashboard.streakDays"
  | "dashboard.checkin.title"
  | "dashboard.checkin.subtitle"
  | "dashboard.energy.title"
  | "dashboard.energy.goodDay"
  | "dashboard.energy.lowEnergy"
  | "dashboard.energy.flareUp"
  | "dashboard.symptoms.label"
  | "dashboard.symptoms.placeholder"
  | "dashboard.save.saving"
  | "dashboard.save.submit"
  | "dashboard.save.success"
  | "dashboard.support.title"
  | "dashboard.support.subtitle"
  | "dashboard.weekly.title"
  | "dashboard.weekly.subtitle"
  | "dashboard.weekly.avgPain"
  | "dashboard.weekly.daysLogged"
  | "dashboard.weekly.highest"
  | "dashboard.weekly.scale"
  | "dashboard.loading"
  | "dashboard.noCycleData"
  | "health.recommendations.empty"
  | "health.recommendations.noSymptoms"
  | "health.recommendations.noCycle"
  | "health.recommendations.highPriority"
  | "health.forecast.levelHigh"
  | "health.forecast.levelModerate"
  | "health.forecast.levelLow"
  | "health.forecast.advice.pacing"
  | "health.forecast.advice.heat"
  | "health.forecast.advice.sleep"
  | "health.forecast.advice.hydrate"
  | "health.forecast.advice.gentleMovement"
  | "health.forecast.advice.trackDaily"
  | "health.forecast.noCycleGuidance"
  | "health.forecast.title"
  | "health.forecast.periodNow"
  | "health.forecast.periodIn"
  | "health.forecast.inWindow"
  | "health.forecast.windowAhead"
  | "health.forecast.calmHigh"
  | "health.forecast.calmModerate"
  | "health.forecast.calmLow"
  | "health.forecast.calmCta"
  | "health.cycle.emptyGuidance"
  | "health.cycle.logCta"
  | "health.cycle.saveCta"
  | "health.cycle.saveError"
  | "health.cycle.startDateAria"
  | "health.cycle.phaseAria"
  | "health.phase.menstrual"
  | "health.phase.follicular"
  | "health.phase.ovulatory"
  | "health.phase.luteal"
  | "health.phase.unknown"
  | "health.flareWindow"
  | "health.currentDay"
  | "health.flareRisk"
  | "health.symptomMap.title"
  | "health.symptomMap.quickLog"
  | "health.category.physical"
  | "health.category.cognitive"
  | "health.category.mood"
  | "health.quickLog.brainFog"
  | "health.quickLog.focusFatigue"
  | "health.quickLog.jointPain"
  | "health.quickLog.emotionalExhaustion"
  | "health.doctorSummaryTitle"
  | "health.correlationAlerts"
  | "health.topHotspots"
  | "health.categoryAverages"
  | "health.physical"
  | "health.cognitive"
  | "health.mood"
  | "health.area.pelvic"
  | "health.area.lower_back"
  | "health.area.widespread"
  | "health.area.joints"
  | "health.area.other"
  | "health.menstrualLog.title"
  | "health.menstrualLog.flow.title"
  | "health.menstrualLog.flow.spotting"
  | "health.menstrualLog.flow.light"
  | "health.menstrualLog.flow.medium"
  | "health.menstrualLog.flow.heavy"
  | "health.menstrualLog.flow.hasClots"
  | "health.menstrualLog.flow.color"
  | "health.menstrualLog.somatic.title"
  | "health.menstrualLog.somatic.cramps"
  | "health.menstrualLog.somatic.headache"
  | "health.menstrualLog.somatic.breastTenderness"
  | "health.menstrualLog.somatic.bloating"
  | "health.menstrualLog.gi.title"
  | "health.menstrualLog.gi.diarrhea"
  | "health.menstrualLog.gi.constipation"
  | "health.menstrualLog.gi.acne"
  | "health.menstrualLog.fertility.title"
  | "health.menstrualLog.fertility.cervicalMucus"
  | "health.menstrualLog.fertility.opk"
  | "health.menstrualLog.mood.title"
  | "health.menstrualLog.mood.tearfulness"
  | "health.menstrualLog.mood.anxiety"
  | "health.menstrualLog.mood.volatility"
  | "health.menstrualLog.mucus.dry"
  | "health.menstrualLog.mucus.sticky"
  | "health.menstrualLog.mucus.creamy"
  | "health.menstrualLog.mucus.watery"
  | "health.menstrualLog.mucus.eggWhite"
  | "health.menstrualLog.opk.negative"
  | "health.menstrualLog.opk.positive"
  | "health.menstrualLog.opk.notUsed"
  | "health.menstrualLog.sensory.none"
  | "health.menstrualLog.sensory.mild"
  | "health.menstrualLog.sensory.moderate"
  | "health.menstrualLog.sensory.severe"
  | "health.menstrualLog.notesLabel"
  | "health.menstrualLog.energy.title"
  | "health.menstrualLog.libido.title"
  | "health.menstrualLog.sensory.title"
  | "health.menstrualLog.sensory.light"
  | "health.menstrualLog.sensory.sound"
  | "health.menstrualLog.saveCta"
  | "health.menstrualLog.savedOk"
  | "health.menstrualLog.saveError"
  | "health.menstrualLog.noActiveCycle"
  | "health.menstrualLog.createCycleFirst"
  | "health.overlap.title"
  | "health.overlap.hormonal"
  | "health.overlap.physical"
  | "health.overlap.noData"
  | "health.carePlan.title"
  | "health.carePlan.diet"
  | "health.carePlan.supplements"
  | "health.carePlan.pacing"
  | "health.carePlan.currentPhase"
  | "health.carePlan.diet.menstrual"
  | "health.carePlan.diet.follicular"
  | "health.carePlan.diet.ovulatory"
  | "health.carePlan.diet.luteal"
  | "health.carePlan.supplements.menstrual"
  | "health.carePlan.supplements.follicular"
  | "health.carePlan.supplements.ovulatory"
  | "health.carePlan.supplements.luteal"
  | "health.carePlan.pacing.menstrual"
  | "health.carePlan.pacing.follicular"
  | "health.carePlan.pacing.ovulatory"
  | "health.carePlan.pacing.luteal"
  | "health.spoonCalc.title"
  | "health.spoonCalc.subtitle"
  | "health.spoonCalc.budget"
  | "health.spoonCalc.sleepQuality"
  | "health.spoonCalc.cycleAdjust"
  | "health.spoonCalc.available"
  | "health.clinicalReport.title"
  | "health.clinicalReport.subtitle"
  | "health.clinicalReport.generate"
  | "health.clinicalReport.generating"
  | "health.clinicalReport.periodRange"
  | "health.clinicalReport.peakPain"
  | "health.clinicalReport.avgEnergy"
  | "health.clinicalReport.avgMood"
  | "health.clinicalReport.symptomSummary"
  | "health.clinicalReport.printCta"
  | "health.clinicalReport.emptyState"
  | "health.caregiver.title"
  | "health.caregiver.subtitle"
  | "health.caregiver.enable"
  | "health.caregiver.disable"
  | "health.caregiver.shareToken"
  | "health.caregiver.copied"
  | "health.caregiver.disclaimer"
  | "health.caregiver.viewOnly"
  | "dashboard.insights.title"
  | "dashboard.insights.subtitle"
  | "dashboard.insights.empty"
  | "dashboard.toast.message"
  | "dashboard.toast.title"
  | "dashboard.toast.dismissAria"
  | "dashboard.toast.calming"
  | "dashboard.toast.zen"
  | "auth.passwordShow"
  | "auth.passwordHide"
  | "common.close"
  | "privacy.unlockDialogAria"
  | "privacy.lockedTitle"
  | "privacy.enterPin"
  | "privacy.incorrectPin"
  | "privacy.digitAria"
  | "privacy.deleteDigitAria"
  | "privacy.digitsEnteredAria"
  | "privacy.forgotPin"
  | "privacy.useBiometrics"
  | "privacy.biometricScanning"
  | "pricing.title"
  | "pricing.subtitle"
  | "pricing.free.name"
  | "pricing.free.price"
  | "pricing.free.perk1"
  | "pricing.free.perk2"
  | "pricing.free.perk3"
  | "pricing.free.perk4"
  | "pricing.pro.badge"
  | "pricing.pro.name"
  | "pricing.pro.price"
  | "pricing.pro.period"
  | "pricing.pro.perk1"
  | "pricing.pro.perk2"
  | "pricing.pro.perk3"
  | "pricing.pro.perk4"
  | "pricing.pro.perk5"
  | "pricing.pro.perk6"
  | "pricing.pro.perk7"
  | "pricing.upgradeCta"
  | "pricing.comingSoon"
  | "pricing.footnote"
  | "pricing.previewTitle"
  | "pricing.previewBody"
  | "profile.pricing"
  | "privacy.security.title"
  | "privacy.security.subtitle"
  | "privacy.security.encryption"
  | "privacy.security.encryptionDesc"
  | "privacy.security.active"
  | "privacy.security.unavailable"
  | "privacy.security.analytics"
  | "privacy.security.analyticsDesc"
  | "privacy.security.export"
  | "privacy.security.exportDesc"
  | "privacy.security.passphrase"
  | "privacy.security.exportBtn"
  | "privacy.security.exportDone"
  | "privacy.security.exportError"
  | "privacy.security.purge"
  | "privacy.security.purgeDesc"
  | "privacy.security.purgeBtn"
  | "privacy.security.purgeConfirmTitle"
  | "privacy.security.purgeConfirmBody"
  | "privacy.security.purged"
  | "privacy.biometricFailed"
  | "privacy.resetPinTitle"
  | "privacy.resetPinCloseAria"
  | "privacy.resetPinPrompt"
  | "privacy.resetPinNew"
  | "privacy.resetPinConfirm"
  | "privacy.resetPinAction"
  | "privacy.resetPinNotSignedIn"
  | "privacy.resetPinSignIn"
  | "privacy.setupDialogAria"
  | "privacy.protectTitle"
  | "privacy.choosePin"
  | "privacy.confirmPin"
  | "privacy.pinMismatch"
  | "quickActions.ariaLabel"
  | "quickActions.checkin.title"
  | "quickActions.checkin.description"
  | "quickActions.logs.title"
  | "quickActions.logs.description"
  | "quickActions.reports.title"
  | "quickActions.reports.description"
  | "quickActions.resources.title"
  | "quickActions.resources.description"
  | "quickActions.consultations.title"
  | "quickActions.consultations.description"
  | "logging.presets.ariaLabel"
  | "logging.presets.calmDay"
  | "logging.presets.mildFlare"
  | "logging.presets.severeFlare"
  | "logging.symptoms.widespreadPain"
  | "logging.symptoms.fatigue"
  | "logging.symptoms.sleepProblems"
  | "logging.symptoms.fibroFog"
  | "logging.symptoms.headache"
  | "logging.symptoms.tenderPoints"
  | "logging.symptoms.stiffness"
  | "logging.symptoms.sensitivity"
  | "logging.symptoms.selected"
  | "logging.slider.label"
  | "logging.slider.ariaLabel"
  | "logging.slider.calm"
  | "logging.slider.moderate"
  | "logging.slider.intense"
  | "flare.title"
  | "flare.on"
  | "flare.off"
  | "flare.activateAria"
  | "flare.deactivateAria"
  | "flare.dimmedMessage"
  | "flare.armedDescription"
  | "flare.suggestion"
  | "flare.crisisOptionsAria"
  | "flare.crisis.emergencyLabel"
  | "flare.crisis.emergencyValue"
  | "flare.crisis.suicideLabel"
  | "flare.crisis.suicideValue"
  | "flare.crisis.samaritansLabel"
  | "flare.crisis.samaritansValue"
  | "today.title"
  | "today.liveWeather"
  | "today.temp"
  | "today.humidity"
  | "today.pressure"
  | "today.impact.low"
  | "today.impact.high"
  | "today.impact.normal"
  | "today.status.stable"
  | "today.status.pressureDrop"
  | "today.trigger.humidityHigh"
  | "today.trigger.heat"
  | "today.trigger.cold"
  | "today.triggers.neutral"
  | "today.estimated"
  | "recent.title"
  | "recent.empty"
  | "recent.today"
  | "recent.painAria"
  | "recent.pain.levelLow"
  | "recent.pain.levelMild"
  | "recent.pain.levelModerate"
  | "recent.pain.levelHigh"
  | "recent.pain.levelSevere"
  | "quotes.quote1"
  | "quotes.quote2"
  | "quotes.quote3"
  | "quotes.quote4"
  | "quotes.quote5"
  | "quotes.quote6"
  | "quotes.quote7"
  | "quotes.quote8"
  | "quotes.quote9"
  | "quotes.quote10"
  | "quotes.quote11"
  | "quotes.quote12"
  | "quotes.author"
  | "medical.title"
  | "medical.subtitle"
  | "medical.generate"
  | "medical.analyzing"
  | "medical.avgPain"
  | "medical.flareDays"
  | "medical.logs"
  | "medical.painTrend"
  | "medical.keyInsights"
  | "medical.insightsEmpty"
  | "medical.questions"
  | "medical.summaryFor"
  | "medical.generated"
  | "medical.close"
  | "medical.error"
  | "medical.generatingAria"
  | "medical.question.flare"
  | "medical.question.highPain"
  | "medical.question.fatigue"
  | "medical.question.sensory"
  | "medical.question.movement"
  | "medical.question.tracking"
  | "reports.pageTitle"
  | "reports.pageSubtitle"
  | "reports.loading"
  | "reports.loadError"
  | "reports.snapshotAria"
  | "reports.stat.avgPain"
  | "reports.stat.flareDays"
  | "reports.stat.topSymptoms"
  | "reports.stat.noneRecorded"
  | "reports.stat.symptom.widespreadPain"
  | "reports.stat.symptom.fatigue"
  | "reports.stat.symptom.sleepProblems"
  | "reports.stat.symptom.fibroFog"
  | "reports.stat.symptom.headache"
  | "reports.stat.symptom.tenderPoints"
  | "reports.stat.symptom.stiffness"
  | "reports.stat.symptom.sensitivity"
  | "reports.insights.subtitle"
  | "reports.insights.empty"
  | "reports.insights.filterLabel"
  | "reports.insights.none"
  | "reports.insights.noneFor"
  | "reports.severity.critical"
  | "reports.severity.warning"
  | "reports.severity.info"
  | "reports.brief.title"
  | "reports.brief.subtitle"
  | "reports.brief.flareFrequency"
  | "reports.brief.flareDaysUnit"
  | "reports.brief.velocity"
  | "reports.brief.functional"
  | "reports.brief.adherence"
  | "reports.brief.medications"
  | "reports.brief.discussion"
  | "reports.brief.headline"
  | "reports.brief.headline.noData"
  | "reports.brief.flareDays.zero"
  | "reports.brief.flareDays.one"
  | "reports.brief.flareDays.two"
  | "reports.brief.flareDays.few"
  | "reports.brief.flareDays.many"
  | "reports.brief.ratePerMonth"
  | "reports.brief.velocity.improving"
  | "reports.brief.velocity.stable"
  | "reports.brief.velocity.worsening"
  | "reports.brief.velocity.insufficientData"
  | "reports.brief.trend.rising"
  | "reports.brief.trend.falling"
  | "reports.brief.trend.stable"
  | "reports.brief.trend.insufficientData"
  | "reports.brief.streakDays"
  | "reports.brief.discussion.worsening"
  | "reports.brief.discussion.painControl"
  | "reports.brief.discussion.medicationsList"
  | "reports.brief.discussion.noMedications"
  | "reports.brief.discussion.sleep"
  | "reports.brief.discussion.weather"
  | "reports.brief.discussion.default"
  | "reports.brief.caveat"
  | "reports.filter.all"
  | "reports.download.title"
  | "reports.download.description"
  | "reports.download.generating"
  | "reports.download.button"
  | "reports.exportError"
  | "reports.brief.detectedTriggers"
  | "pdf.title"
  | "pdf.subtitle"
  | "pdf.patient"
  | "pdf.reportDate"
  | "pdf.reportingPeriod"
  | "pdf.periodRange"
  | "pdf.executiveSummary"
  | "pdf.avgPain"
  | "pdf.flareDays"
  | "pdf.primarySymptoms"
  | "pdf.entries"
  | "pdf.briefTitle"
  | "pdf.chartTitle"
  | "pdf.notEnoughData"
  | "pdf.correlationTitle"
  | "pdf.correlationText"
  | "pdf.noCorrelation"
  | "pdf.insightsTitle"
  | "pdf.insightsEmpty"
  | "pdf.annexTitle"
  | "pdf.annexSubtitle"
  | "pdf.footer"
  | "pdf.colDate"
  | "pdf.colPain"
  | "pdf.colMood"
  | "pdf.colSymptoms"
  | "pdf.avg7d"
  | "pdf.na"
  | "pdf.noMedsMentioned"
  | "careInsight.ariaLabel"
  | "careInsight.title"
  | "careInsight.flareCalm"
  | "careInsight.flareMild"
  | "careInsight.flareSevere"
  | "careInsight.easing"
  | "careInsight.watch"
  | "careInsight.title.severeHeat"
  | "careInsight.title.severe"
  | "careInsight.title.mildHeat"
  | "careInsight.title.mild"
  | "careInsight.title.calmHeat"
  | "careInsight.title.calm"
  | "careInsight.heat.severe"
  | "careInsight.heat.mild"
  | "careInsight.heat.calm"
  | "careInsight.humidity.humidSevere"
  | "careInsight.humidity.humid"
  | "careInsight.humidity.dry"
  | "careInsight.humidity.moderate"
  | "careInsight.barometric.dropping"
  | "careInsight.barometric.low"
  | "careInsight.trend.rising"
  | "careInsight.trend.falling"
  | "careInsight.trend.stable"
  | "careInsight.suggest.severe.1"
  | "careInsight.suggest.severe.2"
  | "careInsight.suggest.severe.3"
  | "careInsight.suggest.mild.1"
  | "careInsight.suggest.mild.2"
  | "careInsight.suggest.mild.3"
  | "careInsight.suggest.calm.1"
  | "careInsight.suggest.calm.2"
  | "careInsight.suggest.calm.3"
  | "insight.highPainAvg.title"
  | "insight.highPainAvg.message"
  | "insight.lowPainAvg.title"
  | "insight.lowPainAvg.message"
  | "insight.frequentFlares.title"
  | "insight.frequentFlares.message"
  | "insight.recurringFlares.title"
  | "insight.recurringFlares.message"
  | "insight.trendWorsening.title"
  | "insight.trendWorsening.message"
  | "insight.trendImproving.title"
  | "insight.trendImproving.message"
  | "insight.weekdayPattern.title"
  | "insight.weekdayPattern.message"
  | "insight.symptomCorrelation.positive.title"
  | "insight.symptomCorrelation.positive.message"
  | "insight.symptomCorrelation.negative.title"
  | "insight.symptomCorrelation.negative.message"
  | "insight.lutealCognitive.title"
  | "insight.lutealCognitive.message"
  | "insight.heatTherapy.title"
  | "insight.heatTherapy.message"
  | "chart.emptyTitle"
  | "chart.emptyHint"
  | "chart.legendPain"
  | "chart.legendAverage"
  | "chart.summary"
  | "chart.aria"
  | "chart.painLevel"
  | "chart.avgLabel"
  | "recovery.sensory.title"
  | "recovery.sensory.on"
  | "recovery.sensory.off"
  | "recovery.sensory.activate"
  | "recovery.sensory.deactivate"
  | "recovery.breath.title"
  | "recovery.breath.description"
  | "recovery.breath.openZen"
  | "recovery.gratitude.title"
  | "recovery.gratitude.description"
  | "recovery.gratitude.ariaLabel"
  | "recovery.gratitude.textareaLabel"
  | "recovery.gratitude.placeholder"
  | "recovery.gratitude.saveEntry"
  | "recovery.gratitude.saved"
  | "recovery.gratitude.chip1"
  | "recovery.gratitude.chip2"
  | "recovery.gratitude.chip3"
  | "spoonTracker.title"
  | "spoonTracker.subtitle"
  | "spoonTracker.undoAria"
  | "spoonTracker.aria"
  | "spoonTracker.removeAria"
  | "spoonTracker.addAria"
  | "spoonTracker.preset.shower"
  | "spoonTracker.preset.walk"
  | "spoonTracker.preset.cooking"
  | "spoonTracker.preset.groceries"
  | "spoonTracker.preset.rest"
  | "spoonTracker.preset.nap"
  | "bodyMap.title"
  | "bodyMap.front"
  | "bodyMap.back"
  | "bodyMap.mobility"
  | "bodyMap.joints"
  | "bodyMap.muscles"
  | "bodyMap.groups"
  | "bodyMap.subtitle"
  | "bodyMap.emptyHint"
  | "bodyMap.point.neck"
  | "bodyMap.point.shoulders"
  | "bodyMap.point.upperArms"
  | "bodyMap.point.lowerBack"
  | "bodyMap.point.knees"
  | "bodyMap.point.occiput"
  | "bodyMap.point.lowCervical"
  | "bodyMap.point.trapezius"
  | "bodyMap.point.supraspinatus"
  | "bodyMap.point.secondRib"
  | "bodyMap.point.epicondyle"
  | "bodyMap.point.gluteal"
  | "bodyMap.point.trochanter"
  | "bodyMap.viewGroupAria"
  | "medication.title"
  | "medication.subtitle"
  | "medication.morningSupplement"
  | "medication.painRelief"
  | "medication.eveningMag"
  | "medication.taken"
  | "medication.pending"
  | "medication.nextDose"
  | "zen.focusBreath"
  | "zen.ultraDark"
  | "zen.exitUltraDark"
  | "zen.switchCalming"
  | "zen.breatheIn"
  | "zen.breatheOut"
  | "zen.soundscapeAria"
  | "zen.sound.rain.label"
  | "zen.sound.rain.description"
  | "zen.sound.forest.label"
  | "zen.sound.forest.description"
  | "zen.sound.whiteNoise.label"
  | "zen.sound.whiteNoise.description"
  | "zen.sound.deepHum.label"
  | "zen.sound.deepHum.description"
  | "zen.pause"
  | "zen.resume"
  | "zen.pausedAria"
  | "zen.volumeAria"
  | "zen.shortcutHint"
  | "narration.title"
  | "narration.explain"
  | "narration.stop"
  | "narration.dismiss"
  | "narration.generatingAria"
  | "narration.offline"
  | "narration.detailedAnalysisTitle"
  | "narration.detailedAnalysisDesc"
  | "narration.patternBody"
  | "narration.aiObservationLabel"
  | "narration.aiObservationText"
  | "narration.missingLogsFallback"
  | "reflection.button"
  | "reflection.stop"
  | "reflection.generatingAria"
  | "reflection.resultLabel"
  | "reflection.dismissAria"
  | "reflection.offline"
  | "companion.openAria"
  | "companion.dialogAria"
  | "companion.title"
  | "companion.waking"
  | "companion.offlineBadge"
  | "companion.liveSimulated"
  | "companion.liveRag"
  | "companion.retrieving"
  | "companion.closeAria"
  | "companion.hello"
  | "companion.suggestion1"
  | "companion.suggestion2"
  | "companion.suggestion3"
  | "companion.offlinePaused"
  | "companion.chatFormAria"
  | "companion.inputLabel"
  | "companion.inputPlaceholder"
  | "companion.checkedData"
  | "companion.errorRetry"
  | "companion.errorDefault"
  | "companion.authRequired"
  | "companion.authExpiredBanner"
  | "companion.authSignIn"
  | "companion.responding"
  | "companion.sendAria"
  | "companion.stopAria"
  | "companion.offlineHint"
  | "companion.mockHint"
  | "logs.pageTitle"
  | "logs.pageSubtitle"
  | "logs.summaryAria"
  | "logs.stat.totalEntries"
  | "logs.stat.avgPain"
  | "logs.stat.flareDays"
  | "logs.stat.totalHint"
  | "logs.stat.avgHint"
  | "logs.stat.flareHint"
  | "logs.empty.title"
  | "logs.empty.description"
  | "logs.empty.cta"
  | "logs.tableTitle"
  | "logs.showing"
  | "logs.searchPlaceholder"
  | "logs.searchAria"
  | "logs.clearAria"
  | "logs.filterLabel"
  | "logs.col.date"
  | "logs.col.pain"
  | "logs.col.mood"
  | "logs.col.notes"
  | "logs.col.action"
  | "logs.noMatch.title"
  | "logs.noMatch.description"
  | "logs.clearFilters"
  | "logs.noNotes"
  | "logs.confirm"
  | "logs.confirmDeleteAria"
  | "logs.deleteAria"
  | "logs.severity.all"
  | "logs.severity.low"
  | "logs.severity.moderate"
  | "logs.severity.severe"
  | "logs.painAria"
  | "profile.pageTitle"
  | "profile.pageSubtitle"
  | "profile.loading"
  | "profile.streakLabel"
  | "profile.days"
  | "profile.totalLogsLabel"
  | "profile.accountTitle"
  | "profile.accountDescription"
  | "profile.displayNameLabel"
  | "profile.displayNamePlaceholder"
  | "profile.saving"
  | "profile.saveChanges"
  | "profile.nameUpdated"
  | "profile.updateFailed"
  | "profile.updateError"
  | "profile.motionTitle"
  | "profile.motionDescription"
  | "profile.gentleMotion"
  | "profile.motionOn"
  | "profile.motionOff"
  | "profile.biometricTitle"
  | "profile.biometricEnable"
  | "profile.biometricEnabled"
  | "profile.biometricDisable"
  | "profile.biometricUnsupported"
  | "video.tab"
  | "video.loading"
  | "video.badge"
  | "video.openExternal"
  | "video.unavailable"
  | "toolkit.title"
  | "toolkit.subtitle"
  | "medications.title"
  | "medications.subtitle"
  | "medications.namePlaceholder"
  | "medications.dosePlaceholder"
  | "medications.timingLabel"
  | "medications.timing.morning"
  | "medications.timing.evening"
  | "medications.timing.bedtime"
  | "medications.add"
  | "medications.remove"
  | "medications.empty"
  | "medications.alerts"
  | "medications.severity.critical"
  | "medications.severity.warning"
  | "medications.severity.caution"
  | "medications.defaultDose"
  | "medications.disclaimer"
  | "somatic.title"
  | "somatic.subtitle"
  | "somatic.painToday"
  | "somatic.spoonsLeft"
  | "somatic.start"
  | "somatic.stop"
  | "somatic.noneSuitable"
  | "somatic.ex.breathing.title"
  | "somatic.ex.breathing.desc"
  | "somatic.ex.humming.title"
  | "somatic.ex.humming.desc"
  | "somatic.ex.eyes.title"
  | "somatic.ex.eyes.desc"
  | "somatic.ex.neck.title"
  | "somatic.ex.neck.desc"
  | "somatic.ex.shoulders.title"
  | "somatic.ex.shoulders.desc"
  | "somatic.ex.catcow.title"
  | "somatic.ex.catcow.desc"
  | "somatic.ex.legs.title"
  | "somatic.ex.legs.desc"
  | "somatic.ex.bodyscan.title"
  | "somatic.ex.bodyscan.desc"
  | "somatic.audio.title"
  | "somatic.audio.binaural432"
  | "somatic.audio.binaural528"
  | "somatic.audio.brown"
  | "somatic.audio.headphonesNote"
  | "somatic.breathing.title"
  | "somatic.breathing.inhale"
  | "somatic.breathing.hold"
  | "somatic.breathing.exhale"
  | "somatic.breathing.idle"
  | "somatic.breathing.idleHint"
  | "somatic.breathing.cycle"
  | "rescue.title"
  | "rescue.subtitle"
  | "rescue.generate"
  | "rescue.regenerate"
  | "rescue.context.pain"
  | "rescue.context.spoons"
  | "rescue.context.weather"
  | "rescue.context.estimate"
  | "rescue.spoonsLabel"
  | "rescue.tip.flare.1"
  | "rescue.tip.flare.2"
  | "rescue.tip.weather.1"
  | "rescue.tip.weather.2"
  | "rescue.tip.moderate.1"
  | "rescue.tip.moderate.2"
  | "rescue.tip.lowSpoons.1"
  | "rescue.tip.lowSpoons.2"
  | "rescue.tip.calm.1"
  | "rescue.tip.calm.2"
  | "rescue.action.flare.1"
  | "rescue.action.flare.2"
  | "rescue.action.weather.1"
  | "rescue.action.weather.2"
  | "rescue.action.moderate.1"
  | "rescue.action.moderate.2"
  | "rescue.action.lowSpoons.1"
  | "rescue.action.lowSpoons.2"
  | "rescue.action.calm.1"
  | "rescue.action.calm.2"
  | "rescue.why.flare.1"
  | "rescue.why.flare.2"
  | "rescue.why.weather.1"
  | "rescue.why.weather.2"
  | "rescue.why.moderate.1"
  | "rescue.why.moderate.2"
  | "rescue.why.lowSpoons.1"
  | "rescue.why.lowSpoons.2"
  | "rescue.why.calm.1"
  | "rescue.why.calm.2"
  | "sleep.title"
  | "sleep.subtitle"
  | "sleep.hours"
  | "sleep.awakenings"
  | "sleep.restLabel"
  | "sleep.rest.1"
  | "sleep.rest.2"
  | "sleep.rest.3"
  | "sleep.rest.4"
  | "sleep.rest.5"
  | "sleep.syncWearable"
  | "sleep.deep"
  | "sleep.hrv"
  | "sleep.restingHr"
  | "sleep.alphaDelta"
  | "sleep.alphaDelta.likely"
  | "sleep.alphaDelta.possible"
  | "sleep.alphaDelta.unlikely"
  | "sleep.alphaDelta.insufficient-data"
  | "sleep.deepStatus"
  | "sleep.deep.low"
  | "sleep.deep.normal"
  | "sleep.deep.high"
  | "sleep.deep.unknown"
  | "sleep.fogRisk"
  | "sleep.fogLevel.low"
  | "sleep.fogLevel.moderate"
  | "sleep.fogLevel.high"
  | "sleep.fogGuidance.low"
  | "sleep.fogGuidance.moderate"
  | "sleep.fogGuidance.high"
  | "sleep.disclaimer"
  | "communityInsights.title"
  | "communityInsights.subtitle"
  | "communityInsights.region"
  | "communityInsights.trendLead"
  | "communityInsights.dominantTrigger"
  | "communityInsights.barometric.falling"
  | "communityInsights.barometric.steady"
  | "communityInsights.barometric.rising"
  | "communityInsights.reportingUsers"
  | "communityInsights.leaderboard"
  | "communityInsights.votes"
  | "communityInsights.disclaimer"
  | "triggers.barometricDrop"
  | "triggers.humidity"
  | "triggers.poorSleep"
  | "triggers.overexertion"
  | "triggers.stress"
  | "coping.pacedBreathing"
  | "coping.warmWaterTherapy"
  | "coping.gradedWalking"
  | "coping.sleepHygiene"
  | "coping.mindfulness"
  | "coping.heatTherapy"
  | "coping.taiChi"
  | "profile.motionToggleAria"
  | "profile.privacyTitle"
  | "profile.privacyDescOn"
  | "profile.privacyDescOff"
  | "profile.newPinLabel"
  | "profile.enableLock"
  | "profile.changePinLabel"
  | "profile.changePinPlaceholder"
  | "profile.update"
  | "profile.disableLock"
  | "profile.lockNow"
  | "profile.signinTitle"
  | "profile.signinDescription"
  | "profile.signedInAs"
  | "profile.signOut"
  | "profile.signInGoogle"
  | "profile.signInGithub"
  | "landing.openMenu"
  | "landing.closeMenu"
  | "landing.signIn"
  | "landing.start"
  | "landing.benefits.pill.core"
  | "landing.benefits.pill.new"
  | "landing.resources.eyebrow"
  | "landing.resources.heading"
  | "landing.resources.viewAll"
  | "landing.resources.card.category.basics"
  | "landing.resources.card.category.diagnosis"
  | "landing.resources.card.category.treatment"
  | "landing.resources.card.category.movement"
  | "landing.resources.card.category.nutrition"
  | "landing.resources.card.category.faq"
  | "landing.resources.card.readGuide"
  | "landing.nav.how"

  | "landing.nav.features"
  | "landing.nav.stories"
  | "landing.nav.faq"
  | "landing.hero.badge"
  | "landing.hero.heading"
  | "landing.hero.subheading"
  | "landing.hero.seeHow"
  | "landing.hero.checkinTitle"
  | "landing.hero.done"
  | "landing.hero.pain"
  | "landing.hero.energy"
  | "landing.hero.sleep"
  | "landing.hero.gentle"
  | "landing.hero.low"
  | "landing.hero.sleepValue"
  | "landing.hero.daily"
  | "landing.hero.pdf"
  | "landing.hero.doctorReady"
  | "landing.hero.minutes"
  | "landing.hero.mockupSub"
  | "landing.hero.freeStart"
  | "landing.hero.noCard"
  | "landing.hero.private"
  | "landing.trust.encrypted"
  | "landing.trust.label"
  | "landing.tagline.eyebrow"
  | "landing.tagline.heading"
  | "landing.tagline.copy"
  | "landing.day.title"
  | "landing.day.rail"
  | "landing.day.scenes"
  | "landing.day.morning"
  | "landing.day.midday"
  | "landing.day.evening"
  | "landing.day.night"
  | "landing.day.morningHeadline"
  | "landing.day.morningCopy"
  | "landing.day.middayHeadline"
  | "landing.day.middayCopy"
  | "landing.day.eveningHeadline"
  | "landing.day.eveningCopy"
  | "landing.day.nightHeadline"
  | "landing.day.nightCopy"
  | "landing.benefits.heading"
  | "landing.benefits.copy"
  | "landing.benefits.checkinsTitle"
  | "landing.benefits.checkinsCopy"
  | "landing.benefits.patternsTitle"
  | "landing.benefits.patternsCopy"
  | "landing.benefits.reportTitle"
  | "landing.benefits.reportCopy"
  | "landing.benefits.toolsTitle"
  | "landing.benefits.toolsCopy"
  | "landing.benefits.privacyTitle"
  | "landing.benefits.privacyCopy"
  | "landing.benefits.readyTitle"
  | "landing.benefits.readyCopy"
  | "landing.how.heading"
  | "landing.how.step1Title"
  | "landing.how.step1Copy"
  | "landing.how.step2Title"
  | "landing.how.step2Copy"
  | "landing.how.step3Title"
  | "landing.how.step3Copy"
  | "landing.testimonials.heading"
  | "landing.testimonials.copy"
  | "landing.testimonials.q1"
  | "landing.testimonials.q2"
  | "landing.testimonials.q3"
  | "landing.testimonials.amiraName"
  | "landing.testimonials.amiraRole"
  | "landing.testimonials.nourName"
  | "landing.testimonials.nourRole"
  | "landing.testimonials.monaName"
  | "landing.testimonials.monaRole"
  | "landing.faq.heading"
  | "landing.faq.copy"
  | "landing.faq.resources"
  | "landing.faq.q1"
  | "landing.faq.a1"
  | "landing.faq.q2"
  | "landing.faq.a2"
  | "landing.faq.q3"
  | "landing.faq.a3"
  | "landing.faq.q4"
  | "landing.faq.a4"
  | "landing.faq.q5"
  | "landing.faq.a5"
  | "landing.faq.q6"
  | "landing.faq.a6"
  | "landing.final.heading"
  | "landing.final.copy"
  | "landing.final.free"
  | "landing.marquee.words"
  | "landing.footer.tagline"
  | "landing.footer.resources"
  | "landing.footer.product"
  | "landing.footer.about"
  | "landing.footer.diagnosis"
  | "landing.footer.treatment"
  | "landing.footer.exercises"
  | "landing.footer.nutrition"
  | "landing.footer.faq"
  | "landing.footer.privacy"
  | "landing.footer.terms"
  | "landing.footer.madeWith"
  | "landing.footer.disclaimer"
  | "landing.footer.copyright"
  | "postMeal.title"
  | "postMeal.subtitle"
  | "postMeal.mealLabel"
  | "postMeal.fatigueLabel"
  | "postMeal.log"
  | "postMeal.saved"
  | "postMeal.recent"
  | "postMeal.undoAria"
  | "postMeal.meal.breakfast"
  | "postMeal.meal.lunch"
  | "postMeal.meal.dinner"
  | "postMeal.meal.snack"
  | "postMeal.fatigue.none"
  | "postMeal.fatigue.mild"
  | "postMeal.fatigue.moderate"
  | "postMeal.fatigue.high"
  | "postMeal.fatigue.severe"
  | "notification.title"
  | "notification.empty"
  | "notification.markAllRead"
  | "notification.bellAria"
  | "notification.closeAria"
  | "notification.dismissAria"
  | "notification.unreadCount"
  | "notification.time.justNow"
  | "notification.time.minutesAgo"
  | "notification.time.hoursAgo"
  | "notification.time.daysAgo"
  | "notification.type.weather_trigger"
  | "notification.type.medication_reminder"
  | "notification.type.daily_checkin"
  | "notification.type.zen_recommendation"
  | "notification.type.ai_prediction"
  | "notification.weather.pressureDrop.title"
  | "notification.weather.pressureDrop.message"
  | "notification.weather.lowPressure.title"
  | "notification.weather.lowPressure.message"
  | "notification.weather.humidity.title"
  | "notification.weather.humidity.message"
  | "notification.weather.heat.title"
  | "notification.weather.heat.message"
  | "notification.weather.cold.title"
  | "notification.weather.cold.message"
  | "notification.ai.spike.title"
  | "notification.ai.spike.message"
  | "notification.medication.due.title"
  | "notification.medication.due.message"
  | "notification.zen.reminder.title"
  | "notification.zen.reminder.message"
  | "notification.dailyLog.reminder.title"
  | "notification.dailyLog.reminder.message"
  | "doctor.title"
  | "doctor.subtitle"
  | "doctor.newPost"
  | "doctor.editPost"
  | "doctor.postTitle"
  | "doctor.postContent"
  | "doctor.postTags"
  | "doctor.publish"
  | "doctor.draft"
  | "doctor.aiAssist"
  | "doctor.aiAssistDescription"
  | "doctor.aiGenerating"
  | "doctor.aiDisclaimer"
  | "doctor.verified"
  | "doctor.pending"
  | "doctor.rejected"
  | "doctor.noPosts"
  | "doctor.feedTitle"
  | "doctor.feedSubtitle"
  | "doctor.readMore"
  | "doctor.backToDashboard"
  | "doctor.dashboardTitle"
  | "doctor.dashboardSubtitle"
  | "doctor.totalPosts"
  | "doctor.publishedCount"
  | "doctor.pendingCount"
  | "doctor.aiLibrary.title"
  | "doctor.aiLibrary.subtitle"
  | "doctor.aiLibrary.reviewed"
  | "doctor.aiLibrary.loading"
  | "doctor.aiLibrary.empty"
  | "doctor.aiLibrary.newBadge"
  | "doctor.aiLibrary.read"
  | "doctor.aiLibrary.disclaimer"
  | "doctor.aiLibrary.signature"
  | "doctor.aiLibrary.refresh"
  | "doctor.aiLibrary.refreshing"
  | "doctor.aiLibrary.refreshed"
  | "doctor.aiLibrary.refreshError"
  | "doctor.aiLibrary.minutesShort"
  | "doctor.aiLibrary.topicsAria"
  | "doctor.aiLibrary.aiGenerated"
  | "doctor.reactions.like"
  | "doctor.reactions.helpful"
  | "doctor.reactions.signInHint"
  | "doctor.authorFallback"
  | "doctor.postError"
  | "doctor.manualPublishing.title"
  | "doctor.manualPublishing.subtitle"
  | "doctor.manualPublishing.openEditor"
  | "doctor.manualPublishing.closeEditor"
  | "doctor.ownPosts.title"
  | "doctor.ownPosts.subtitle"
  | "doctor.postTitlePlaceholder"
  | "doctor.postContentPlaceholder"
  | "doctor.postTagsPlaceholder"
  | "doctor.aiAssistPlaceholder"
  | "doctor.postSubmitted"
  | "doctor.postEditorDescription"
  | "doctor.postKindLabel"
  | "doctor.kind.article"
  | "doctor.kind.research"
  | "doctor.kind.status"
  | "doctor.socialFeedTitle"
  | "doctor.socialFeedSubtitle"
  | "doctor.composerPlaceholder"
  | "doctor.feed.like"
  | "doctor.feed.comment"
  | "doctor.feed.share"
  | "doctor.filter.all"
  | "doctor.feed.searchPlaceholder"
  | "doctor.feed.searchLabel"
  | "doctor.feed.clearSearch"
  | "doctor.feed.topicsLabel"
  | "doctor.feed.sortLabel"
  | "doctor.feed.sort.newest"
  | "doctor.feed.sort.popular"
  | "doctor.feed.resultsCount"
  | "doctor.feed.noResults"
  | "doctor.feed.noResultsHint"
  | "doctor.feed.activeFilters"
  | "doctor.feed.clearAll"
  | "doctor.feed.filtersToggle"
  | "doctor.postMedia"
  | "doctor.postContentStatus"
  | "doctor.postAiToggle"
  | "doctor.postAiToggleDescription"
  | "doctor.postSubmittedStatus"
  | "consultation.title"
  | "consultation.subtitle"
  | "consultation.newConsultation"
  | "consultation.subject"
  | "consultation.selectDoctor"
  | "consultation.startThread"
  | "consultation.open"
  | "consultation.closed"
  | "consultation.messages"
  | "consultation.typeMessage"
  | "consultation.hide"
  | "consultation.dismiss"
  | "consultation.structuredMessage"
  | "consultation.suggestedQuestions"
  | "consultation.noMessages"
  | "consultation.unknown"
  | "consultation.patientLabel"
  | "consultation.doctorLabel"
  | "consultation.send"
  | "consultation.noConsultations"
  | "consultation.patientAssistant"
  | "consultation.patientAssistantDescription"
  | "consultation.clinicalSummary"
  | "consultation.clinicalSummaryDescription"
  | "consultation.aiDraft"
  | "consultation.aiDraftDescription"
  | "consultation.aiDisclaimer"
  | "consultation.symptomHelper"
  | "consultation.symptomHelperDescription"
  | "consultation.symptomPlaceholder"
  | "consultation.noDoctorsAvailable"
  | "consultation.selectDoctorPlaceholder"
  | "consultation.subjectPlaceholder"
  | "consultation.backToList"
  | "consultation.clinicalMemo"
  | "consultation.suggestedResponse"
  | "consultation.useDraft"
  | "pro.page.title"
  | "pro.page.subtitle"
  | "pro.page.doctorHubTitle"
  | "pro.page.doctorHubDesc"
  | "pro.page.consultationsTitle"
  | "pro.page.consultationsDesc"
  | "pro.page.aiCopilotTitle"
  | "pro.page.aiCopilotDesc"
  | "pro.page.cta"
  | "pro.page.doctorHubBadge"
  | "pro.page.consultationsBadge"
  | "pro.page.aiCopilotBadge"
  | "symptomTracker.title"
  | "symptomTracker.subtitle"
  | "symptomTracker.selectSymptoms"
  | "symptomTracker.notes"
  | "symptomTracker.notesPlaceholder"
  | "symptomTracker.generateReport"
  | "symptomTracker.collapseAll"
  | "symptomTracker.expandAll"
  | "symptomTracker.clearAll"
  | "symptomTracker.totalChecked"
  | "symptomTracker.category.pain"
  | "symptomTracker.category.physical"
  | "symptomTracker.category.postExertional"
  | "symptomTracker.category.headFaceJaw"
  | "symptomTracker.category.sensory"
  | "symptomTracker.pain.neckShoulders"
  | "symptomTracker.pain.upperBack"
  | "symptomTracker.pain.lowerBackHips"
  | "symptomTracker.pain.armsElbows"
  | "symptomTracker.pain.legsKnees"
  | "symptomTracker.pain.chestWall"
  | "symptomTracker.physical.severeFatigue"
  | "symptomTracker.physical.morningStiffness"
  | "symptomTracker.physical.sleepDisturbances"
  | "symptomTracker.physical.numbnessTingling"
  | "symptomTracker.physical.rls"
  | "symptomTracker.physical.burningColdSensations"
  | "symptomTracker.postExertional.postShower"
  | "symptomTracker.postExertional.postMeal"
  | "symptomTracker.postExertional.exhaustionGoingOut"
  | "symptomTracker.head.fibroFog"
  | "symptomTracker.head.memoryLapses"
  | "symptomTracker.head.tensionHeadaches"
  | "symptomTracker.head.tmjJawPain"
  | "symptomTracker.head.facialTension"
  | "symptomTracker.sensory.lightNoise"
  | "symptomTracker.sensory.ibsDigestive"
  | "symptomTracker.sensory.palpitationsDizziness"
  | "symptomTracker.sensory.moodAnxiety"
  | "doctorReport.title"
  | "doctorReport.subtitle"
  | "doctorReport.close"
  | "doctorReport.patientInfo"
  | "doctorReport.date"
  | "doctorReport.painLevel"
  | "doctorReport.energyMood"
  | "doctorReport.checkedSymptoms"
  | "doctorReport.category"
  | "doctorReport.notes"
  | "doctorReport.noSymptoms"
  | "doctorReport.noNotes"
  | "doctorReport.noSymptomsMessage"
  | "doctorReport.noNotesMessage"
  | "doctorReport.copyToClipboard"
  | "doctorReport.copied"
  | "doctorReport.printReport"
  | "doctorReport.disclaimer"
  | "nav.diet"
  | "diet.title"
  | "diet.subtitle"
  | "diet.energy.exhausted"
  | "diet.energy.low"
  | "diet.energy.moderate"
  | "diet.energy.good"
  | "diet.energy.full"
  | "diet.logger.title"
  | "diet.logger.subtitle"
  | "diet.logger.date"
  | "diet.logger.time"
  | "diet.logger.mealType"
  | "diet.logger.mealType.breakfast"
  | "diet.logger.mealType.lunch"
  | "diet.logger.mealType.dinner"
  | "diet.logger.mealType.snack"
  | "diet.logger.foods"
  | "diet.logger.foodsPlaceholder"
  | "diet.logger.amount"
  | "diet.logger.amountPlaceholder"
  | "diet.logger.addFood"
  | "diet.logger.energyBefore"
  | "diet.logger.energyBefore.hint"
  | "diet.logger.notes"
  | "diet.logger.notesPlaceholder"
  | "diet.logger.save"
  | "diet.logger.saving"
  | "diet.logger.saved"
  | "diet.logger.delete"
  | "diet.logger.noMeals"
  | "diet.logger.mealsLabel"
  | "diet.warn.known.gluten"
  | "diet.warn.known.dairy"
  | "diet.warn.known.sugar"
  | "diet.warn.known.fried"
  | "diet.warn.known.processed"
  | "diet.warn.known.alcohol"
  | "diet.warn.known.caffeine"
  | "diet.warn.personal"
  | "diet.warnings.none"
  | "diet.warnings.some"
  | "diet.warnings.swap"
  | "diet.warnings.reason"
  | "diet.swap.gluten.swap"
  | "diet.swap.gluten.reason"
  | "diet.swap.dairy.swap"
  | "diet.swap.dairy.reason"
  | "diet.swap.sugar.swap"
  | "diet.swap.sugar.reason"
  | "diet.swap.fried.swap"
  | "diet.swap.fried.reason"
  | "diet.swap.processed.swap"
  | "diet.swap.processed.reason"
  | "diet.swap.alcohol.swap"
  | "diet.swap.alcohol.reason"
  | "diet.swap.caffeine.swap"
  | "diet.swap.caffeine.reason"
  | "diet.timing.veryLow.title"
  | "diet.timing.veryLow.reason"
  | "diet.timing.low.title"
  | "diet.timing.low.reason"
  | "diet.timing.moderate.title"
  | "diet.timing.moderate.reason"
  | "diet.timing.good.title"
  | "diet.timing.good.reason"
  | "diet.timing.full.title"
  | "diet.timing.full.reason"
  | "diet.triggers.title"
  | "diet.triggers.subtitle"
  | "diet.triggers.name"
  | "diet.triggers.severity"
  | "diet.triggers.severity.hint"
  | "diet.triggers.severity.level1"
  | "diet.triggers.severity.level2"
  | "diet.triggers.severity.level3"
  | "diet.triggers.severity.level4"
  | "diet.triggers.severity.level5"
  | "diet.triggers.reactionNote"
  | "diet.triggers.reactionNotePlaceholder"
  | "diet.triggers.namePlaceholder"
  | "diet.triggers.add"
  | "diet.triggers.adding"
  | "diet.triggers.empty"
  | "diet.triggers.remove"
  | "diet.triggers.removed"
  | "diet.correlation.title"
  | "diet.correlation.subtitle"
  | "diet.correlation.disclaimer"
  | "diet.correlation.empty"
  | "diet.correlation.baseline"
  | "diet.correlation.baseline.hint"
  | "diet.correlation.food"
  | "diet.correlation.with"
  | "diet.correlation.without"
  | "diet.correlation.lift"
  | "diet.correlation.outOf"
  | "diet.correlation.evenings"
  | "diet.correlation.risk.high"
  | "diet.correlation.risk.moderate"
  | "diet.correlation.risk.watch"
  | "diet.correlation.risk.high.hint"
  | "diet.correlation.risk.moderate.hint"
  | "diet.correlation.risk.watch.hint"
  | "diet.correlation.timing.title"
  | "diet.correlation.timing.highFlare"
  | "diet.correlation.timing.lowFlare"
  | "diet.correlation.timing.later"
  | "diet.correlation.timing.nodata"

  | "fog.title"
  | "fog.hero.kicker"
  | "fog.hero.subtitle"
  | "fog.hero.statEpisodes"
  | "fog.hero.statAvg"
  | "fog.hero.statRecent"
  | "fog.hero.statNone"
  | "fog.hero.clearGuide"
  | "fog.hero.fogGuide"
  | "fog.hero.privacy"
  | "fog.hero.privacyDetail"
  | "fog.trigger.lowSleep"
  | "fog.trigger.stress"
  | "fog.trigger.screen"
  | "fog.trigger.noise"
  | "fog.trigger.lowFood"
  | "fog.trigger.menstrual"
  | "fog.trigger.multitasking"
  | "fog.trigger.overwhelm"
  | "fog.trigger.weather"
  | "fog.trigger.medication"
  | "fog.trigger.overdid"
  | "fog.trigger.other"
  | "fog.breath.title"
  | "fog.breath.subtitle"
  | "fog.breath.pattern478"
  | "fog.breath.patternBox"
  | "fog.breath.start"
  | "fog.breath.pause"
  | "fog.breath.reset"
  | "fog.breath.cycles"
  | "fog.breath.sessionComplete"
  | "fog.breath.seconds"
  | "fog.breath.inhale"
  | "fog.breath.hold"
  | "fog.breath.exhale"
  | "fog.dump.title"
  | "fog.dump.subtitle"
  | "fog.dump.where"
  | "fog.dump.chars"
  | "fog.dump.intensity"
  | "fog.dump.triggers"
  | "fog.dump.save"
  | "fog.dump.saving"
  | "fog.dump.saved"
  | "fog.dump.clear"
  | "fog.dump.needsOne"
  | "fog.dump.recent"
  | "fog.dump.noTriggers"
  | "fog.microtask.title"
  | "fog.microtask.subtitle"
  | "fog.microtask.prompt"
  | "fog.microtask.placeholder"
  | "fog.microtask.breakdown"
  | "fog.microtask.step"
  | "fog.microtask.saveToggle"
  | "fog.microtask.saved"
  | "fog.microtask.allDone"
  | "fog.microtask.newTask"
  | "fog.microtask.theTask"
  | "fog.microtask.assist1"
  | "fog.microtask.assist2"
  | "fog.microtask.assist3"
  | "fog.save.locked"
  | "fog.save.invalid"
  | "fog.save.failed"
  | "fog.sos.title"
  | "fog.sos.subtitle"
  | "fog.sos.step1"
  | "fog.sos.step1desc"
  | "fog.sos.step2"
  | "fog.sos.step2desc"
  | "fog.sos.step3"
  | "fog.sos.step3desc"
  | "fog.sos.step4"
  | "fog.sos.step4desc"
  | "fog.sos.steady"
  | "fog.sos.callClinic"
  | "fog.sos.callTrusted"
  | "fog.sos.emergency"
  | "fog.sos.steadier"
  | "quickActions.fog.title"
  | "quickActions.fog.description"
  | "toolkit.fogCard.title"
  | "toolkit.fogCard.subtitle"
  | "toolkit.fogCard.open"

  | "clinical.acr.title"
  | "clinical.acr.subtitle"
  | "clinical.acr.ss.level.0"
  | "clinical.acr.ss.level.1"
  | "clinical.acr.ss.level.2"
  | "clinical.acr.ss.level.3"
  | "clinical.acr.wpi.title"
  | "clinical.acr.wpi.subtitle"
  | "clinical.acr.wpi.count"
  | "clinical.acr.ss.title"
  | "clinical.acr.ss.hint"
  | "clinical.acr.ss.fatigue"
  | "clinical.acr.ss.unrefreshed"
  | "clinical.acr.ss.cognitive"
  | "clinical.acr.somatic.title"
  | "clinical.acr.somatic.subtitle"
  | "clinical.acr.somatic.bandHint"
  | "clinical.acr.duration.title"
  | "clinical.acr.duration.label"
  | "clinical.acr.evaluate"
  | "clinical.acr.result.criteriaMet"
  | "clinical.acr.result.criteriaNotMet"
  | "clinical.acr.result.interpretation"
  | "clinical.acr.result.wpi"
  | "clinical.acr.result.ss"
  | "clinical.acr.result.generalized"
  | "clinical.acr.result.scoreRule"
  | "clinical.acr.result.duration"
  | "clinical.acr.result.met"
  | "clinical.acr.result.notMet"
  | "clinical.acr.summaryTitle"
  | "clinical.acr.summary.wpi"
  | "clinical.acr.summary.ss"
  | "clinical.acr.summary.generalized"
  | "clinical.acr.summary.scoreRule"
  | "clinical.acr.summary.duration"
  | "clinical.acr.summary.criteria"
  | "clinical.acr.savedToProfile"
  | "clinical.acr.signInHint"
  | "clinical.acr.saveToProfile"
  | "clinical.acr.savedToProfileHint"
  | "clinical.acr.signInHintBody"
  | "clinical.acr.shareError"
  | "clinical.acr.disclaimer"

  | "clinical.lab.title"
  | "clinical.lab.subtitle"
  | "clinical.lab.latestNone"
  | "clinical.lab.test"
  | "clinical.lab.date"
  | "clinical.lab.value"
  | "clinical.lab.valueRequired"
  | "clinical.lab.hint"
  | "clinical.lab.reference"
  | "clinical.lab.note"
  | "clinical.lab.notePlaceholder"
  | "clinical.lab.add"
  | "clinical.lab.history"
  | "clinical.lab.empty"
  | "clinical.lab.delete"
  | "clinical.lab.disclaimer"
  | "clinical.lab.verdict.low"
  | "clinical.lab.verdict.inRange"
  | "clinical.lab.verdict.high"
  | "clinical.lab.tsh.label"
  | "clinical.lab.tsh.hint"
  | "clinical.lab.ft4.label"
  | "clinical.lab.ft4.hint"
  | "clinical.lab.vitaminD.label"
  | "clinical.lab.vitaminD.hint"
  | "clinical.lab.esr.label"
  | "clinical.lab.esr.hint"
  | "clinical.lab.crp.label"
  | "clinical.lab.crp.hint"

  | "clinical.meds.title"
  | "clinical.meds.subtitle"
  | "clinical.meds.due"
  | "clinical.meds.dueEmpty"
  | "clinical.meds.taken"
  | "clinical.meds.markTaken"
  | "clinical.meds.adherence"
  | "clinical.meds.mySchedule"
  | "clinical.meds.empty"
  | "clinical.meds.remove"
  | "clinical.meds.addTitle"
  | "clinical.meds.add"
  | "clinical.meds.addAria"
  | "clinical.meds.disclaimer"
  | "clinical.meds.frequency.once"
  | "clinical.meds.frequency.twice"
  | "clinical.meds.frequency.threeTimes"
  | "clinical.meds.frequency.asNeeded"

  | "clinical.somatic.headache"
  | "clinical.somatic.lowerAbdomenPain"
  | "clinical.somatic.depression"
  | "clinical.somatic.constipation"
  | "clinical.somatic.diarrhea"
  | "clinical.somatic.nausea"
  | "clinical.somatic.dizziness"
  | "clinical.somatic.tingling"
  | "clinical.somatic.irritableBowel"
  | "clinical.somatic.tinnitus"
  | "clinical.somatic.blurredVision"
  | "clinical.somatic.chestPain"
  | "clinical.somatic.dryMouth"
  | "clinical.somatic.mouthUlcers"
  | "clinical.somatic.skinSensitivity"
  | "clinical.somatic.anxiety"
  | "clinical.somatic.restlessLegs"
  | "clinical.somatic.coldIntolerance"

  | "clinical.trigger.title"
  | "clinical.trigger.subtitle"
  | "clinical.trigger.date"
  | "clinical.trigger.severity"
  | "clinical.trigger.severityHint"
  | "clinical.trigger.factors"
  | "clinical.trigger.note"
  | "clinical.trigger.notePlaceholder"
  | "clinical.trigger.addEntry"
  | "clinical.trigger.added"
  | "clinical.trigger.insights"
  | "clinical.trigger.frequencyLabel"
  | "clinical.trigger.avgSeverity"
  | "clinical.trigger.history"
  | "clinical.trigger.empty"
  | "clinical.trigger.delete"
  | "clinical.trigger.group.weather"
  | "clinical.trigger.group.stress"
  | "clinical.trigger.group.sleep"
  | "clinical.trigger.group.diet"
  | "clinical.trigger.group.activity"
  | "clinical.trigger.group.other"
  | "clinical.trigger.weatherPressure"
  | "clinical.trigger.cold"
  | "clinical.trigger.heat"
  | "clinical.trigger.stress"
  | "clinical.trigger.poorSleep"
  | "clinical.trigger.overexertion"
  | "clinical.trigger.dietary"
  | "clinical.trigger.sittingTooLong"
  | "clinical.trigger.hormonal"
  | "clinical.trigger.illness"

  | "clinical.wpi.shoulderL"
  | "clinical.wpi.shoulderR"
  | "clinical.wpi.upperArmL"
  | "clinical.wpi.upperArmR"
  | "clinical.wpi.lowerArmL"
  | "clinical.wpi.lowerArmR"
  | "clinical.wpi.hipL"
  | "clinical.wpi.hipR"
  | "clinical.wpi.upperLegL"
  | "clinical.wpi.upperLegR"
  | "clinical.wpi.lowerLegL"
  | "clinical.wpi.lowerLegR"
  | "clinical.wpi.jawL"
  | "clinical.wpi.jawR"
  | "clinical.wpi.chest"
  | "clinical.wpi.abdomen"
  | "clinical.wpi.neck"
  | "clinical.wpi.upperBack"
  | "clinical.wpi.lowerBack"
  | "toolkit.clinicalTitle"
  | "toolkit.clinicalSubtitle"


  | "sos.fab"
  | "sos.dismissFab"
  | "sos.modal.title"
  | "sos.modal.subtitle"
  | "sos.close"
  | "sos.breath.title"
  | "sos.breath.hint"
  | "sos.breath.done"
  | "sos.message.title"
  | "sos.message.body"
  | "sos.message.share"
  | "sos.message.copy"
  | "sos.guide.title"
  | "sos.guide.sit"
  | "sos.guide.head"
  | "sos.guide.sip"
  | "sos.guide.call"
  | "sos.emergencyCall"
  | "sos.privacyNote"
  | "spoon.checkin.title"
  | "spoon.checkin.subtitle"
  | "spoon.checkin.question"
  | "spoon.checkin.guide.ask"
  | "spoon.checkin.guide.spend"
  | "spoon.checkin.guide.rest"
  | "spoon.checkin.mode.spend"
  | "spoon.checkin.mode.rest"
  | "spoon.checkin.savedNote"
  | "spoon.checkin.saving"
  | "spoon.checkin.week"
  | "spoon.checkin.signInRequired"
  | "spoon.checkin.locked"
  | "spoon.checkin.invalid"
  | "spoon.checkin.failed"
  | "pantry.title"
  | "pantry.subtitle"
  | "pantry.haveQuestion"
  | "pantry.loading"
  | "pantry.noMatch"
  | "pantry.bestMatch"
  | "pantry.minutes"
  | "pantry.disclaimer"
  | "pantry.ing.oats"
  | "pantry.ing.oliveOil"
  | "pantry.ing.fattyFish"
  | "pantry.ing.leafyGreens"
  | "pantry.ing.berries"
  | "pantry.ing.nuts"
  | "pantry.ing.yogurt"
  | "pantry.ing.turmeric"
  | "pantry.ing.ginger"
  | "pantry.ing.eggs"
  | "pantry.ing.bananas"
  | "pantry.ing.wholeGrainBread"
  | "pantry.meal.oatBerryBowl"
  | "pantry.meal.oatBerryBowl.how"
  | "pantry.meal.turmericYogurtBowl"
  | "pantry.meal.turmericYogurtBowl.how"
  | "pantry.meal.toastAvocadoSpinach"
  | "pantry.meal.toastAvocadoSpinach.how"
  | "pantry.meal.sardineToast"
  | "pantry.meal.sardineToast.how"
  | "pantry.meal.gingerBananaSmoothie"
  | "pantry.meal.gingerBananaSmoothie.how"
  | "pantry.meal.eggGreenScramble"
  | "pantry.meal.eggGreenScramble.how"
  | "family.title"
  | "family.subtitle"
  | "family.shareTitle"
  | "family.copy"
  | "family.copied"
  | "family.copyFailed"
  | "family.share"
  | "family.privacyNote"
  | "family.card.flare.title"
  | "family.card.flare.body"
  | "family.card.fog.title"
  | "family.card.fog.body"
  | "family.card.crash.title"
  | "family.card.crash.body"
  | "movement.title"
  | "movement.off"
  | "movement.minutes"
  | "movement.popup.title"
  | "movement.done"
  | "movement.snooze"
  | "movement.dismiss"
  | "movement.stretch.neck"
  | "movement.stretch.shoulders"
  | "movement.stretch.wrists"
  | "movement.stretch.hips"
  | "movement.stretch.calves"
  | "support.title"
  | "support.subtitle"
  | "summary.title"
  | "summary.subtitle"
  | "summary.loading"
  | "summary.unavailable"
  | "summary.heading"
  | "summary.line.period"
  | "summary.line.avgPain"
  | "summary.line.peakPain"
  | "summary.line.flareDays"
  | "summary.line.cycleDays"
  | "summary.line.symptomAvg"
  | "summary.line.adherence"
  | "summary.line.meds"
  | "summary.line.medsNone"
  | "summary.generated"
  | "summary.print"
  | "summary.none"

  | "nav.clinical"
  | "clinical.hub.title"
  | "clinical.hub.subtitle"
  | "clinical.hub.trackersTitle"
  | "clinical.hub.trackersSubtitle"
  | "clinical.hub.lifestyleTitle"
  | "clinical.hub.lifestyleSubtitle"
  | "clinical.hub.reportTitle"
  | "clinical.hub.reportSubtitle"

  | "clinical.exercise.title"
  | "clinical.exercise.subtitle"
  | "clinical.exercise.filter.all"
  | "clinical.exercise.intensity.gentle"
  | "clinical.exercise.intensity.light"
  | "clinical.exercise.intensity.moderate"
  | "clinical.exercise.minutes"
  | "clinical.exercise.stepsLabel"
  | "clinical.exercise.clearance"
  | "clinical.exercise.tipsTitle"
  | "clinical.exercise.tip.1"
  | "clinical.exercise.tip.2"
  | "clinical.exercise.tip.3"
  | "clinical.exercise.tip.4"
  | "clinical.exercise.walking.title"
  | "clinical.exercise.walking.details"
  | "clinical.exercise.walking.steps"
  | "clinical.exercise.water.title"
  | "clinical.exercise.water.details"
  | "clinical.exercise.water.steps"
  | "clinical.exercise.taiChi.title"
  | "clinical.exercise.taiChi.details"
  | "clinical.exercise.taiChi.steps"
  | "clinical.exercise.yoga.title"
  | "clinical.exercise.yoga.details"
  | "clinical.exercise.yoga.steps"
  | "clinical.exercise.stretching.title"
  | "clinical.exercise.stretching.details"
  | "clinical.exercise.stretching.steps"
  | "clinical.exercise.strength.title"
  | "clinical.exercise.strength.details"
  | "clinical.exercise.strength.steps"
  | "clinical.exercise.cycling.title"
  | "clinical.exercise.cycling.details"
  | "clinical.exercise.cycling.steps"
  | "clinical.exercise.seatedBand.title"
  | "clinical.exercise.seatedBand.details"
  | "clinical.exercise.seatedBand.steps"

  | "clinical.sleep.title"
  | "clinical.sleep.subtitle"
  | "clinical.sleep.checklistTitle"
  | "clinical.sleep.score"
  | "clinical.sleep.reading.strong"
  | "clinical.sleep.reading.building"
  | "clinical.sleep.reading.starting"
  | "clinical.sleep.hint.strong"
  | "clinical.sleep.hint.building"
  | "clinical.sleep.hint.starting"
  | "clinical.sleep.disclaimer"
  | "clinical.sleep.consistentSchedule.title"
  | "clinical.sleep.consistentSchedule.body"
  | "clinical.sleep.darkCoolRoom.title"
  | "clinical.sleep.darkCoolRoom.body"
  | "clinical.sleep.screenWindDown.title"
  | "clinical.sleep.screenWindDown.body"
  | "clinical.sleep.caffeineCutoff.title"
  | "clinical.sleep.caffeineCutoff.body"
  | "clinical.sleep.eveningRoutine.title"
  | "clinical.sleep.eveningRoutine.body"
  | "clinical.sleep.preSleepRelaxation.title"
  | "clinical.sleep.preSleepRelaxation.body"
  | "clinical.sleep.gentleDaylight.title"
  | "clinical.sleep.gentleDaylight.body"
  | "clinical.sleep.painComfortPrep.title"
  | "clinical.sleep.painComfortPrep.body"

  | "clinical.coping.title"
  | "clinical.coping.subtitle"
  | "clinical.coping.pacing.title"
  | "clinical.coping.pacing.body"
  | "clinical.coping.pacing.action"
  | "clinical.coping.breathing.title"
  | "clinical.coping.breathing.body"
  | "clinical.coping.breathing.action"
  | "clinical.coping.grounding.title"
  | "clinical.coping.grounding.body"
  | "clinical.coping.grounding.action"
  | "clinical.coping.heatComfort.title"
  | "clinical.coping.heatComfort.body"
  | "clinical.coping.heatComfort.action"
  | "clinical.coping.sensoryShutdown.title"
  | "clinical.coping.sensoryShutdown.body"
  | "clinical.coping.sensoryShutdown.action"
  | "clinical.coping.support.title"
  | "clinical.coping.support.body"
  | "clinical.coping.support.action"
  | "clinical.coping.breath.title"
  | "clinical.coping.breath.subtitle"
  | "clinical.coping.breath.start"
  | "clinical.coping.breath.pause"
  | "clinical.coping.breath.reset"
  | "clinical.coping.breath.inhale"
  | "clinical.coping.breath.hold"
  | "clinical.coping.breath.exhale"
  | "clinical.coping.breath.cycleCount"
  | "clinical.coping.breath.aria"
  | "clinical.coping.disclaimer"

  | "clinical.report.title"
  | "clinical.report.subtitle"
  | "clinical.report.period.week"
  | "clinical.report.period.month"
  | "clinical.report.stat.avgPain"
  | "clinical.report.stat.peakPain"
  | "clinical.report.stat.flareDays"
  | "clinical.report.stat.adherence"
  | "clinical.report.trigger.title"
  | "clinical.report.trigger.none"
  | "clinical.report.trigger.top"
  | "clinical.report.lab.title"
  | "clinical.report.lab.none"
  | "clinical.report.meds.title"
  | "clinical.report.meds.none"
  | "clinical.report.acr.title"
  | "clinical.report.acr.met"
  | "clinical.report.acr.notMet"
  | "clinical.report.acr.none"
  | "clinical.report.cycle.title"
  | "clinical.report.cycle.none"
  | "clinical.report.empty"
  | "clinical.report.copy"
  | "clinical.report.copied"
  | "clinical.report.shareHint"

  | "caregiver.badge"
  | "caregiver.title"
  | "caregiver.readOnly"
  | "caregiver.level.high"
  | "caregiver.level.moderate"
  | "caregiver.level.low"
  | "caregiver.daysToPeriod"
  | "caregiver.cyclePhase"
  | "caregiver.unknown"
  | "caregiver.insight"
  | "caregiver.linkInactive"

  | "doctor.filter.searchLabel"
  | "doctor.filter.searchPlaceholder"
  | "doctor.filter.topic"
  | "doctor.filter.topicAll"
  | "doctor.filter.topics.pain"
  | "doctor.filter.topics.sleep"
  | "doctor.filter.topics.fatigue"
  | "doctor.filter.topics.medication"
  | "doctor.filter.topics.nutrition"
  | "doctor.filter.topics.mentalHealth"
  | "doctor.filter.topics.research"
  | "doctor.filter.topics.lifestyle"
  | "doctor.filter.specialization"
  | "doctor.filter.specAll"
  | "doctor.filter.spec.rheumatology"
  | "doctor.filter.spec.neurology"
  | "doctor.filter.spec.painMedicine"
  | "doctor.filter.spec.physiatry"
  | "doctor.filter.spec.physiotherapy"
  | "doctor.filter.spec.psychology"
  | "doctor.filter.spec.generalMedicine"
  | "doctor.filter.clear"
  | "doctor.filter.showing"
  | "doctor.filter.noResults";

export const translations: Record<Locale, Record<TranslationKey, string>> = {
  en: {
    "nav.dashboard": "Dashboard",
    "nav.healthLogs": "Health Logs",
    "nav.resources": "Resources",
    "nav.profile": "Profile",
    "nav.toolkit": "Toolkit",
    "nav.backToDashboard": "Back to Dashboard",
    "nav.doctorHub": "Doctor Hub",
    "nav.consultations": "Consultations",
    "nav.upgradePro": "Upgrade Pro",
    "nav.language": "Language",
    "nav.switchToArabic": "Switch to Arabic",
    "nav.switchToEnglish": "Switch to English",
    "nav.breadcrumb": "Breadcrumb",
    "nav.goBack": "Go back",
    "nav.mainMenu": "Menu",
    "nav.primaryNav": "Primary navigation",
    "consultationsHub.title": "Consultations & Symptom Structuring",
    "consultationsHub.subtitle": "Organize your symptoms with AI, review your clinical brief, and message your care team securely.",
    "consultationsHub.viewAllThreads": "View all threads",
    "consultationsHub.intakeTitle": "AI Symptom Structuring",
    "consultationsHub.intakeDescription": "Describe how you've been feeling in your own words — the AI organizes it into a clear, clinical-ready summary.",
    "consultationsHub.persistOption": "Also save this check-in to my health log",
    "consultationsHub.processing": "Structuring…",
    "consultationsHub.structureAction": "Structure my symptoms",
    "consultationsHub.copy": "Copy",
    "consultationsHub.intakeFailed": "Couldn't structure the symptoms. Please try again.",
    "consultationsHub.briefDescription": "Your 30-day AI clinical executive brief, ready to share with your doctor.",
    "consultationsHub.briefLoading": "Preparing your brief…",
    "consultationsHub.briefEmpty": "No clinical brief available yet — log your symptoms for a few days to generate one.",
    "consultationsHub.messagingTitle": "Secure Messaging",
    "consultationsHub.messagingDescription": "End-to-end access-controlled threads with your verified doctors. Only you and your doctor can read these messages.",
    "consultationsHub.loadingThreads": "Loading your threads…",
    "consultationsHub.sendFailed": "Message couldn't be sent. Please try again.",
    "consultationsHub.severitySlider": "severity, out of 10",
    "consultationsHub.reviewShareTitle": "Review & share",
    "consultationsHub.logToRecordOption": "Save these symptoms to my health log",
    "consultationsHub.shareThreadLabel": "Share the summary with a doctor",
    "consultationsHub.shareThreadPlaceholder": "Choose a conversation…",
    "consultationsHub.submitAction": "Save & share",
    "consultationsHub.submitting": "Submitting…",
    "consultationsHub.submitFailed": "Submission failed. Please try again.",
    "consultationsHub.loggedPart": "{count} symptom(s) saved to your log",
    "consultationsHub.sentPart": "Summary sent to your doctor",
    "header.themeLight": "Switch to light mode",
    "header.themeDark": "Switch to dark mode",
    "ai.statusLabel": "AI Care Companion",
    "ai.checking": "Checking AI status…",
    "ai.live": "Live",
    "ai.mock": "Mock mode",
    "ai.offline": "Offline",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.loading": "Loading...",
    "common.readMore": "Read More",
    "common.back": "Back",
    "common.signInRequired": "You must be signed in.",
    "auth.login.title": "Welcome back",
    "auth.login.description": "Sign in to continue your check-ins, trends, and gentle support.",
    "resources.title": "Care Resources",
    "resources.subtitle": "Explore guides, tips, and educational content to help you manage fibromyalgia with confidence.",
    "resources.search": "Search resources...",
    "resources.all": "All",
    "resources.about": "About Fibromyalgia",
    "resources.diagnosis": "Diagnosis",
    "resources.treatment": "Treatment & Self-Care",
    "resources.nutrition": "Nutrition",
    "resources.exercises": "Exercises",
    "resources.faq": "FAQ",
    "resources.community": "Community",
    "resources.filterAria": "Filter resources by category",
    "resources.category.all": "All",
    "resources.category.managingFlares": "Managing Flares",
    "resources.category.nutritionHydration": "Nutrition & Hydration",
    "resources.category.gentleMovement": "Gentle Movement",
    "resources.category.mentalSupport": "Mental Support",
    "resources.tipsFor": "Practical tips for {category}.",
    "resources.card.flarePacing.title": "Pacing Techniques",
    "resources.card.flarePacing.description": "Learn how to balance activity and rest to prevent crashes.",
    "resources.card.flarePacing.tip1": "Break tasks into smaller, manageable chunks.",
    "resources.card.flarePacing.tip2": "Set a timer for activities and take a break before you feel tired.",
    "resources.card.flarePacing.tip3": "Prioritize the most important tasks of the day.",
    "resources.card.flarePacing.tip4": "Listen to your body's early warning signs.",
    "resources.card.flareHeat.title": "Gentle Heat Therapy",
    "resources.card.flareHeat.description": "Using warmth to soothe stiff joints and relax muscles.",
    "resources.card.flareHeat.tip1": "Use warm compresses or heating pads on affected areas.",
    "resources.card.flareHeat.tip2": "Try warm baths with Epsom salts to reduce muscle tension.",
    "resources.card.flareHeat.tip3": "Ensure heat sources are not too hot to avoid skin burns.",
    "resources.card.flareHeat.tip4": "Apply warmth for 15-20 minutes at a time.",
    "resources.card.antiInflammatory.title": "Anti-Inflammatory Diet",
    "resources.card.antiInflammatory.description": "Foods that may help reduce inflammation and joint pain.",
    "resources.card.antiInflammatory.tip1": "Incorporate omega-3 rich foods like salmon, walnuts, and flaxseeds.",
    "resources.card.antiInflammatory.tip2": "Eat plenty of colorful berries and leafy greens.",
    "resources.card.antiInflammatory.tip3": "Reduce processed sugars and refined carbohydrates.",
    "resources.card.antiInflammatory.tip4": "Experiment with turmeric and ginger for natural anti-inflammatory properties.",
    "resources.card.hydration.title": "Hydration Strategies",
    "resources.card.hydration.description": "Tips for staying hydrated even when water feels like a chore.",
    "resources.card.hydration.tip1": "Carry a reusable water bottle with you at all times.",
    "resources.card.hydration.tip2": "Try infused water with cucumber or lemon for more flavor.",
    "resources.card.hydration.tip3": "Set reminders to drink water throughout the day.",
    "resources.card.hydration.tip4": "Eat water-rich foods like watermelon and cucumber.",
    "resources.card.stretching.title": "Gentle Stretching",
    "resources.card.stretching.description": "Low-impact ways to maintain flexibility without overexertion.",
    "resources.card.stretching.tip1": "Focus on slow, rhythmic movements.",
    "resources.card.stretching.tip2": "Never push through sharp pain; stretch only to a point of mild tension.",
    "resources.card.stretching.tip3": "Use a chair or wall for support during stretches.",
    "resources.card.stretching.tip4": "Hold stretches for 15-30 seconds and breathe deeply.",
    "resources.card.walking.title": "Low-Impact Walking",
    "resources.card.walking.description": "Ways to incorporate walking into your routine safely.",
    "resources.card.walking.tip1": "Start with very short distances and gradually increase.",
    "resources.card.walking.tip2": "Walk on flat, stable surfaces to avoid falls.",
    "resources.card.walking.tip3": "Wear supportive, comfortable footwear.",
    "resources.card.walking.tip4": "Take frequent breaks and walk in a pace that allows you to talk comfortably.",
    "resources.card.mindfulness.title": "Mindfulness Practices",
    "resources.card.mindfulness.description": "Calming the mind to better manage the emotional toll of pain.",
    "resources.card.mindfulness.tip1": "Practice deep belly breathing for 5 minutes daily.",
    "resources.card.mindfulness.tip2": "Try a guided meditation app for relaxation.",
    "resources.card.mindfulness.tip3": "Focus on a few things you are grateful for each morning.",
    "resources.card.mindfulness.tip4": "Use grounding techniques: find 5 things you can see, 4 you can touch, etc.",
    "resources.card.sleepHygiene.title": "Sleep Hygiene",
    "resources.card.sleepHygiene.description": "Building a routine for deeper, more restorative sleep.",
    "resources.card.sleepHygiene.tip1": "Maintain a consistent sleep and wake schedule.",
    "resources.card.sleepHygiene.tip2": "Avoid screens at least one hour before bed.",
    "resources.card.sleepHygiene.tip3": "Create a calming bedtime ritual (e.g., herbal tea, light reading).",
    "resources.card.sleepHygiene.tip4": "Keep your bedroom cool, dark, and quiet.",
    "resources.card.breathwork.title": "Breathwork for Flares",
    "resources.card.breathwork.description": "Slow breathing techniques to calm the nervous system during a flare.",
    "resources.card.breathwork.tip1": "Try the 4-7-8 pattern: inhale 4, hold 7, exhale 8.",
    "resources.card.breathwork.tip2": "Sit comfortably and breathe low into your belly.",
    "resources.card.breathwork.tip3": "Start with 2 minutes; more if it feels good.",
    "resources.card.audioTherapy.title": "Audio Therapy",
    "resources.card.audioTherapy.description": "Soothing sounds and binaural tones for pain days.",
    "resources.card.audioTherapy.tip1": "Use brown noise or calm music to ease flare discomfort.",
    "resources.card.audioTherapy.tip2": "Binaural beats work best with headphones.",
    "resources.card.audioTherapy.tip3": "Pair audio therapy with pacing or heat for the best effect.",
    "resources.card.flarePacing.summary.1": "Break tasks into small steps.",
    "resources.card.flarePacing.summary.2": "Rest before you feel tired — set a timer.",
    "resources.card.flarePacing.summary.3": "Keep activity steady; avoid boom-bust days.",
    "resources.card.flareHeat.summary.1": "Apply moist heat for 15–20 minutes.",
    "resources.card.flareHeat.summary.2": "A warm bath or shower relaxes tight muscles.",
    "resources.card.flareHeat.summary.3": "Keep heat warm, never hot enough to burn.",
    "resources.card.antiInflammatory.summary.1": "Add omega-3 foods: salmon, walnuts, flaxseed.",
    "resources.card.antiInflammatory.summary.2": "Fill half your plate with vegetables and fruit.",
    "resources.card.antiInflammatory.summary.3": "Cut processed sugar, not whole foods.",
    "resources.card.hydration.summary.1": "Keep a water bottle within reach.",
    "resources.card.hydration.summary.2": "Set 2–3 gentle water reminders a day.",
    "resources.card.hydration.summary.3": "Eat water-rich foods too: melon, cucumber.",
    "resources.card.stretching.summary.1": "Move slowly; stop at mild tension.",
    "resources.card.stretching.summary.2": "Hold 15–30 seconds and breathe through it.",
    "resources.card.stretching.summary.3": "Use a chair or wall for support.",
    "resources.card.walking.summary.1": "Start with 5–10 minutes on flat ground.",
    "resources.card.walking.summary.2": "Increase time slowly, not distance first.",
    "resources.card.walking.summary.3": "Walk at a pace where you can talk.",
    "resources.card.mindfulness.summary.1": "Breathe low and slow for 2 minutes.",
    "resources.card.mindfulness.summary.2": "Name 5 things you see, 4 you can feel.",
    "resources.card.mindfulness.summary.3": "One small gratitude each morning.",
    "resources.card.sleepHygiene.summary.1": "Same wake time every day, even weekends.",
    "resources.card.sleepHygiene.summary.2": "No screens 1 hour before bed.",
    "resources.card.sleepHygiene.summary.3": "Keep the room cool, dark, and quiet.",
    "resources.card.breathwork.summary.1": "Try 4-7-8: in 4s, hold 7s, out 8s.",
    "resources.card.breathwork.summary.2": "Two minutes is enough to start.",
    "resources.card.breathwork.summary.3": "Breathe low into the belly, not the chest.",
    "resources.card.audioTherapy.summary.1": "Calm music or brown noise lowers tension.",
    "resources.card.audioTherapy.summary.2": "Use headphones for binaural beats.",
    "resources.card.audioTherapy.summary.3": "Play it during flares or wind-down.",
    "resources.ai.summaryTitle": "Quick AI Summary",
    "resources.ai.toggle": "Quick AI Summary (TL;DR)",
    "resources.ai.hide": "Hide summary",
    "resources.ai.verified": "Verified Source",
    "resources.ai.guidelineLabel": "Cited guideline",
    "resources.ai.titleLabel": "Medical title",
    "resources.ai.originLabel": "Clinical origin",
    "resources.ai.summaryLabel": "Clinical summary",
    "resources.ai.viewGuideline": "View cited guideline",
    "resources.ai.unverified": "Couldn't verify this in the knowledge index",
    "resources.ai.unverifiedNote": "Safe offline guidance instead: keep demands low, rest, and stay hydrated. Contact your care team if symptoms are severe or unusual.",
    "resources.ai.foggy": "Explain like I'm foggy",
    "resources.ai.standard": "Standard language",
    "resources.plan.title": "AI Flare Action Plan",
    "resources.plan.subtitle": "A 3-step immediate relief protocol from your pain, energy, and weather.",
    "resources.plan.create": "Create Action Plan",
    "resources.plan.rebuild": "Rebuild Plan",
    "resources.plan.step": "Step {n}",
    "resources.plan.basedOn": "Based on: {context}",
    "resources.plan.step.rest.title": "Rest low and slow",
    "resources.plan.step.rest.detail": "Lie down in a dim, quiet room for 10–20 minutes. Lower demands rather than pushing through.",
    "resources.plan.step.heat.title": "Apply gentle heat",
    "resources.plan.step.heat.detail": "A warm compress on tight areas, or a warm bath, for 15–20 minutes. Warm, never hot enough to burn.",
    "resources.plan.step.breathe.title": "Slow your breathing",
    "resources.plan.step.breathe.detail": "Two minutes of slow belly breathing (4-7-8) to lower the stress response that amplifies pain.",
    "resources.plan.step.pace.title": "Pace the rest of the day",
    "resources.plan.step.pace.detail": "Postpone non-essential tasks, break the rest into small steps, and keep activity steady to avoid a crash.",
    "resources.plan.step.environment.title": "Cut stimulation",
    "resources.plan.step.environment.detail": "Dim lights, reduce noise, limit screens, and keep a low-stimulation space for the next hour.",
    "resources.plan.step.hydrate.title": "Stay hydrated",
    "resources.plan.step.hydrate.detail": "Keep water within reach and sip slowly; dehydration adds to fatigue and fog.",
    "resources.plan.step.resume.title": "Resume gradually",
    "resources.plan.step.resume.detail": "Return to normal activity slowly once the flare settles, to avoid a crash-rebound cycle.",
    "resources.plan.step.care.title": "Watch and reach out",
    "resources.plan.step.care.detail": "If pain is severe, unusually long, or comes with fever, numbness, or chest pain, contact your care team.",
    "resources.bodyMap.title": "Body Symptom Map",
    "resources.bodyMap.subtitle": "Tap a body area to filter resources and find localized therapies.",
    "resources.bodyMap.part.neck": "Neck",
    "resources.bodyMap.part.shoulders": "Shoulders",
    "resources.bodyMap.part.lowerBack": "Lower Back",
    "resources.bodyMap.part.hips": "Hips",
    "resources.bodyMap.part.knees": "Knees",
    "resources.bodyMap.part.joints": "Joints",
    "resources.bodyMap.clear": "Clear selection",
    "resources.bodyMap.heatHint": "Heat therapy may help here",
    "resources.bodyMap.movementHint": "Gentle movement may help here",
    "resources.bodyMap.rotateHint": "Drag or tilt to explore in 3D",
    "resources.bodyMap.tapHint": "Tap a glowing node to log pain there",
    "resources.semantic.matched": "Matched: {category}",
    "resources.semantic.clear": "Clear search",
    "resources.effort.low": "Low effort",
    "resources.effort.medium": "Moderate effort",
    "resources.painAware.banner": "High pain today — showing the gentlest options first",
    "resources.painAware.highPain": "High pain",
    "resources.empty": "No resources match your search. Try a different term or clear the filters.",
    "resources.feed.title": "Personalized care feed",
    "resources.feed.subtitle": "A fresh, gentle shortlist shaped by your pain, energy, and weather.",
    "resources.feed.refresh": "Refresh feed",
    "resources.feed.refreshing": "Refreshing...",
    "resources.feed.live": "AI-ranked from curated care resources",
    "resources.feed.offline": "Personalized locally from curated care resources",
    "about.title": "About Fibromyalgia",
    "about.subtitle": "Understanding your condition is the first step toward better management.",
    "about.overview": "What is Fibromyalgia?",
    "about.causes": "Potential Causes",
    "about.symptoms": "Common Symptoms",
    "about.causesDetail": "The exact cause of fibromyalgia is not fully understood, but researchers believe it involves a combination of genetic, environmental, and psychological factors. Key theories include:\n\nAbnormal pain processing: The central nervous system amplifies pain signals, making you more sensitive to stimuli.\n\nGenetic factors: Fibromyalgia tends to run in families, suggesting certain genetic mutations may increase susceptibility.\n\nPhysical or emotional trauma: Post-traumatic stress disorder (PTSD), surgery, or significant emotional distress can trigger the condition.\n\nSleep disturbances: Chronic sleep disorders like restless legs syndrome or sleep apnea are commonly associated.\n\nInfections: Some illnesses appear to trigger or worsen fibromyalgia symptoms.",
    "about.symptomsDetail": "The hallmark symptom of fibromyalgia is widespread musculoskeletal pain, but the condition affects many body systems:\n\nWidespread Pain: A persistent dull ache lasting at least three months, occurring on both sides of the body and above and below the waist.\n\nFatigue: Even after sleeping for long periods, people with fibromyalgia often wake up tired. Sleep is frequently disrupted by pain.\n\nCognitive Difficulties (Fibro Fog): Problems with concentration, attention, and memory are common.\n\nSleep Problems: Many patients experience insomnia or non-restorative sleep.\n\nHeadaches and Migraines: Frequent tension headaches or migraines.\n\nStiffness: Especially noticeable in the morning upon waking.\n\nSensitivity: Heightened sensitivity to light, noise, temperature, and odors.\n\nDigestive Issues: Irritable bowel syndrome (IBS) frequently co-occurs.",
    "about.overviewContent": "Fibromyalgia is a chronic condition that causes widespread musculoskeletal pain, along with fatigue, sleep problems, cognitive difficulties, and other symptoms. While there is no known cure, symptoms can be effectively managed with the right approach.",
    "about.overviewPlain": "Fibromyalgia is a long-term condition where your body feels pain more easily than it should. It also brings deep tiredness, poor sleep, and trouble focusing. There is no cure, but the right routine can help a lot.",
    "about.causesPlain": "Doctors don't know exactly what causes fibromyalgia. It seems to run in families, and things like stress, injury, or illness can bring it on. Your brain may simply turn up the volume on pain signals — it's a real condition, not something imagined.",
    "about.symptomsPlain": "The main sign is pain across your whole body that lasts for months. You may also wake up tired, have trouble focusing, sleep poorly, and feel stiff. These are all real symptoms of the condition, not laziness.",
    "about.highlight.prevalence.label": "Prevalence",
    "about.highlight.prevalence.value": "2-4% of the population",
    "about.highlight.pain.label": "Pain",
    "about.highlight.pain.value": "Chronic, widespread",
    "about.highlight.management.label": "Management",
    "about.highlight.management.value": "Effectively manageable",
    "about.symptom.pain.label": "Widespread pain",
    "about.symptom.pain.value": "A dull ache on both sides, 3+ months",
    "about.symptom.fatigue.label": "Fatigue",
    "about.symptom.fatigue.value": "Waking unrefreshed even after long sleep",
    "about.symptom.fog.label": "Fibro fog",
    "about.symptom.fog.value": "Trouble focusing, attention, memory",
    "about.symptom.sleep.label": "Sleep problems",
    "about.symptom.sleep.value": "Insomnia or non-restorative sleep",
    "about.symptom.headache.label": "Headaches & migraines",
    "about.symptom.headache.value": "Frequent tension headaches or migraines",
    "about.symptom.sensitivity.label": "Heightened sensitivity",
    "about.symptom.sensitivity.value": "Light, noise, temperature, and odors feel intense",
    "about.symptom.stiffness.label": "Stiffness",
    "about.symptom.stiffness.value": "Stiffness and soreness, especially in the morning",
    "about.symptom.digestive.label": "Digestive issues",
    "about.symptom.digestive.value": "Irritable bowel syndrome (IBS) is common and frequent",
    "about.cause.amplified.title": "Central sensitization",
    "about.cause.amplified.desc": "The brain and spinal cord turn up the volume on pain signals, so sensations that shouldn't hurt — light pressure, mild heat — are felt as pain.",
    "about.cause.genetic.title": "Genetic predisposition",
    "about.cause.genetic.desc": "Fibromyalgia often runs in families, suggesting inherited differences in how the nervous system handles pain.",
    "about.cause.trauma.title": "Physical or emotional trauma",
    "about.cause.trauma.desc": "Surgery, injury, infection, or prolonged stress can act as a trigger that flips the nervous system into a sensitized state.",
    "about.cause.sleep.title": "Sleep disturbances",
    "about.cause.sleep.desc": "Conditions like restless legs or sleep apnea disrupt deep sleep and may both trigger and worsen fibromyalgia symptoms.",
    "about.cause.infection.title": "Infections",
    "about.cause.infection.desc": "Some viral or bacterial illnesses appear to set off fibromyalgia or amplify an existing pattern of symptoms.",
    "about.causesIntro": "The exact cause isn't fully understood — most researchers describe a combination of these factors.",
    "about.symptomsIntro": "Fibromyalgia affects many body systems. These are the symptoms most patients describe.",
    "about.gutBrain.title": "The Gut–Brain Connection",
    "about.gutBrain.intro": "Up to 70% of people with fibromyalgia also experience IBS. Here's why the two are linked.",
    "about.gutBrain.detail": "The gut and brain constantly talk to each other through the vagus nerve, immune signals, and the microbiome. When fibromyalgia turns up the volume on pain and stress, the gut feels it too — leading to bloating, pain, and altered motility. Supporting one often supports the other.",
    "about.gut.node.brain": "Central nervous system",
    "about.gut.node.brainHint": "Pain & stress processing",
    "about.gut.node.vagus": "Vagus nerve",
    "about.gut.node.vagusHint": "Two-way information highway",
    "about.gut.node.gut": "Gut & microbiome",
    "about.gut.node.gutHint": "Immune & serotonin signalling",
    "about.gut.node.symptoms": "IBS symptoms",
    "about.gut.node.symptomsHint": "Bloating, pain, irregularity",
    "about.gut.tip.bloating": "Bloating & distension",
    "about.gut.tip.motility": "Altered bowel motility",
    "about.gut.tip.stress": "Stress-driven flares",
    "about.gut.tip.microbiome": "Microbiome balance",
    "about.weatherSensitivity.title": "Weather Sensitivity & Temperature Changes",
    "about.weatherSensitivity.eyebrow": "Environmental triggers",
    "about.weatherSensitivity.intro": "Weather is one of the most reported environmental triggers for fibromyalgia flares. In summer, extreme heat can dial up pain signals and fatigue; in winter, cold and dampness increase muscle stiffness and slow, aching muscles. Rapid swings in temperature and barometric pressure — the kind that arrive with storms or changing seasons — make the sensitized nervous system feel under threat, amplifying pain, stiffness, and exhaustion within hours.",
    "about.weatherSensitivity.tip.heat": "Summer heat: keep cool & hydrated",
    "about.weatherSensitivity.tip.cold": "Winter chill: layer up & warm up",
    "about.weatherSensitivity.tip.pressure": "Pressure swings: check forecasts, pace the day",
    "about.weatherSensitivity.tip.transition": "Sudden changes: transition slowly in & out",
    "about.visual.eyebrow": "Understanding the condition",
    "about.visual.symptoms.caption": "Soft body map — areas most affected by fibromyalgia",
    "about.visual.gutBrain.eyebrow": "Why IBS is so common",
    "diagnosis.title": "Diagnosis",
    "diagnosis.subtitle": "Learn how fibromyalgia is diagnosed and what to expect during the process.",
    "diagnosis.howDiagnosed": "How is Fibromyalgia Diagnosed?",
    "diagnosis.tests": "Tests and Evaluations",
    "diagnosis.specialist": "When to See a Specialist",
    "diagnosis.criteria": "Fibromyalgia is diagnosed based on symptoms and by ruling out other conditions. The American College of Rheumatology criteria include:\n\nWidespread pain index (WPI) and symptom severity scale (SSS) scoring\nPain and symptoms present for at least three months\nNo other disorder that would otherwise explain the pain\n\nDoctors may also use tender point testing, where specific areas of the body are pressed to assess sensitivity.",
    "diagnosis.exams": "While there is no single definitive test for fibromyalgia, your doctor may order tests to rule out other conditions:\n\nComplete Blood Count (CBC): Checks for signs of infection or anemia\nErythrocyte Sedimentation Rate (ESR): Measures inflammation levels\nThyroid Function Tests: Rules out thyroid disorders\nVitamin D Levels: Deficiency can mimic fibromyalgia symptoms\nRheumatoid Factor: Rules out rheumatoid arthritis\nSleep Studies: Identifies sleep disorders that may contribute to symptoms\n\nThese tests help ensure your symptoms are not caused by another treatable condition.",
    "diagnosis.criteriaPlain": "Doctors diagnose fibromyalgia mainly by listening to your symptoms and ruling out other conditions. They look at two scores: the Widespread Pain Index (WPI) — how many body areas hurt — and the Symptom Severity Scale (SSS) — how strong your fatigue, sleep, and thinking problems are. Symptoms must last at least 3 months, and no other disorder should explain them.",
    "diagnosis.examsPlain": "There is no single blood test that confirms fibromyalgia. Your doctor orders tests mainly to rule out other conditions that could explain your symptoms: a complete blood count (CBC) for anemia or infection, an ESR for inflammation, thyroid tests, vitamin D levels, and a rheumatoid factor check. A sleep study may be added if sleep problems are suspected.",
    "diagnosis.specialistDetail": "If you have had widespread pain and fatigue for three months or more, and symptoms are affecting your daily life, it is worth asking your primary care doctor for a referral to a rheumatologist. A specialist can review your symptoms, order the right tests, and confirm or rule out fibromyalgia.",
    "diagnosis.specialistPlain": "If pain and tiredness have lasted 3 months or more and are getting in the way of daily life, ask your regular doctor about seeing a rheumatologist — a specialist who can check your symptoms, run the right tests, and give you a clear answer.",
    "diagnosis.criteria.wpi.label": "WPI",
    "diagnosis.criteria.wpi.value": "Widespread Pain Index — pain in at least 7 of 19 areas",
    "diagnosis.criteria.sss.label": "SSS",
    "diagnosis.criteria.sss.value": "Symptom Severity Scale — fatigue, sleep, cognitive",
    "diagnosis.criteria.duration.label": "Duration",
    "diagnosis.criteria.duration.value": "Symptoms present for at least 3 months",
    "diagnosis.criteria.exclusion.label": "Exclusion",
    "diagnosis.criteria.exclusion.value": "No other disorder explains the pain",
    "diagnosis.exam.cbc.label": "CBC",
    "diagnosis.exam.cbc.value": "Complete Blood Count — infection or anemia",
    "diagnosis.exam.esr.label": "ESR",
    "diagnosis.exam.esr.value": "Erythrocyte Sedimentation Rate — inflammation",
    "diagnosis.exam.thyroid.label": "Thyroid",
    "diagnosis.exam.thyroid.value": "Thyroid function tests — thyroid disorders",
    "diagnosis.exam.vitaminD.label": "Vitamin D",
    "diagnosis.exam.vitaminD.value": "Deficiency can mimic fibromyalgia symptoms",
    "diagnosis.exam.rheumatoid.label": "Rheumatoid factor",
    "diagnosis.exam.rheumatoid.value": "Rules out rheumatoid arthritis",
    "diagnosis.exam.sleep.label": "Sleep studies",
    "diagnosis.exam.sleep.value": "Identifies contributing sleep disorders",
    "diagnosis.specialistHighlight.1": "See a rheumatologist if symptoms persist",
    "diagnosis.specialistHighlight.2": "Keep a symptom diary",
    "diagnosis.specialistHighlight.3": "Seek specialist evaluation",
    "resources.takeaway.title": "AI 1-Minute Takeaway",
    "resources.takeaway.subtitle": "The essentials, in 3 short points",
    "resources.takeaway.open": "Show takeaway",
    "resources.takeaway.close": "Hide takeaway",
    "resources.takeaway.about.1": "Fibromyalgia is a real, chronic condition — the nervous system amplifies pain signals.",
    "resources.takeaway.about.2": "It combines widespread pain with fatigue, poor sleep, and cognitive fog.",
    "resources.takeaway.about.3": "There's no cure, but symptoms can be managed well with the right plan.",
    "resources.takeaway.diagnosis.1": "Diagnosis is clinical: WPI + SSS scoring, symptoms for 3+ months, nothing else explains it.",
    "resources.takeaway.diagnosis.2": "No blood test confirms it — labs are used to rule out other conditions first.",
    "resources.takeaway.diagnosis.3": "A rheumatologist can evaluate your symptoms and confirm or rule out fibromyalgia.",
    "resources.takeaway.treatment.1": "Care starts with non-drug approaches: patient education, graded exercise, and CBT.",
    "resources.takeaway.treatment.2": "Medications help some people — choices are individual and should be guided by your care team.",
    "resources.takeaway.treatment.3": "The goal is better function and quality of life, not eliminating pain entirely.",
    "resources.takeaway.nutrition.1": "A Mediterranean-style, anti-inflammatory diet is supportive — not curative.",
    "resources.takeaway.nutrition.2": "Focus on vegetables, fruit, whole grains, and omega-3 rich fish; go easy on processed food and sugar.",
    "resources.takeaway.nutrition.3": "Stay hydrated — dehydration can worsen fatigue and brain fog.",
    "resources.takeaway.exercises.1": "Graded aerobic and strengthening exercise has the strongest evidence of any non-drug option.",
    "resources.takeaway.exercises.2": "Start far below capacity and increase very slowly — a few minutes of walking or warm-water sessions.",
    "resources.takeaway.exercises.3": "Low-impact options like walking, swimming, tai chi, and yoga are usually best tolerated.",
    "resources.takeaway.faq.1": "Fibromyalgia is a chronic condition, but symptoms can be managed well with the right plan.",
    "resources.takeaway.faq.2": "There's no known cure — care combines medication, therapy, exercise, stress management, and lifestyle.",
    "resources.takeaway.faq.3": "Diagnosis can take time; a symptom diary and a rheumatologist referral help.",
    "resources.takeaway.community.1": "Sharing experiences with people who understand reduces isolation.",
    "resources.takeaway.community.2": "Peer tips (heat, pacing, gentle movement) complement clinical guidance.",
    "resources.takeaway.community.3": "Mindfulness and stress reduction are part of the evidence-based toolkit.",
    "resources.takeaway.cycle.1": "Hormone dips before the period can heighten fibromyalgia pain sensitivity and brain fog.",
    "resources.takeaway.cycle.2": "Flares often cluster in a window 3–7 days before menstruation — plan a lighter schedule then.",
    "resources.takeaway.cycle.3": "Tracking your cycle and symptoms together turns that rhythm into an early-warning forecast.",
    "resources.cycle": "Fibromyalgia & Menstrual Cycle",
    "cycle.title": "Fibromyalgia & the Menstrual Cycle: Mechanism, Pain Forecasting, and Coping",
    "cycle.subtitle": "Why symptoms often intensify before your period — and how anticipating the pattern helps you stay ahead of it.",
    "cycle.eyebrow": "Hormones & pain sensitivity",
    "cycle.intro": "Many women with fibromyalgia notice symptoms surge in the days before menstruation. That is not coincidence: reproductive-hormone fluctuations interact with the same central nervous system amplification that defines fibromyalgia.",
    "cycle.mechanism.title": "The scientific & biological link",
    "cycle.mechanism.body": "In the late luteal phase (the days just before menstruation) estrogen and progesterone fall naturally. Estrogen helps regulate serotonin and norepinephrine — neurotransmitters that dampen pain signals in the central nervous system. When they drop, pain inhibition weakens, producing temporary heightened pain sensitivity (hyperalgesia), deeper fatigue, and stronger brain fog. On a nervous system that already amplifies signals, that dip can tip well-managed symptoms into a flare.",
    "cycle.phase.menstrual": "Menstruation",
    "cycle.phase.menstrualSub": "Hormones at their lowest — sensitivity often stays elevated early in bleeding days.",
    "cycle.phase.follicular": "Follicular phase",
    "cycle.phase.follicularSub": "Estrogen climbs — many report their best-functioning days here.",
    "cycle.phase.ovulatory": "Ovulation",
    "cycle.phase.ovulatorySub": "Estrogen peaks, then swings — brief sensitivity spikes are possible.",
    "cycle.phase.luteal": "Luteal phase",
    "cycle.phase.lutealSub": "Progesterone rises, then both hormones fall — sensitivity starts creeping up.",
    "cycle.phase.window": "Pre-period risk window",
    "cycle.phase.windowSub": "Roughly 3–7 days before the period — the classic flare cluster for fibromyalgia.",
    "cycle.forecast.title": "Predicting the flare before it arrives",
    "cycle.forecast.body": "Because the effect is rhythmic, it can be anticipated. Severe pain and muscle stiffness typically precede menstruation by 3 to 7 days. FibroCare's cycle tracking learns your interval, and the flare forecast on your dashboard opens an early-warning window — the moment to activate your flare plan: lighter schedule, heat ready, sleep protected, medication taken on time.",
    "cycle.forecast.badge": "Flare-risk window: 3–7 days before the period",
    "cycle.forecast.hint": "The dashboard's Flare Forecast card updates automatically as you log cycles.",
    "cycle.tips.title": "Proactive self-care strategies",
    "cycle.tip.spoons.title": "Spoon management",
    "cycle.tip.spoons.body": "Trim non-essential daily tasks by roughly 30% during the pre-period window. Front-load must-dos earlier in the cycle and schedule real rest breaks.",
    "cycle.tip.heat.title": "Thermal therapy",
    "cycle.tip.heat.body": "Warm compresses or a warm bath relax muscle spasms and stiffness. Apply heat to pelvic and lower-back areas before the flare peaks, not after.",
    "cycle.tip.nutrition.title": "Nutritional support",
    "cycle.tip.nutrition.body": "Lean on anti-inflammatory foods — vegetables, omega-3 fish, whole grains — and ease off caffeine and added sugars, which can amplify sensitivity and disrupt sleep.",
    "cycle.image.caption": "The menstrual cycle and fibromyalgia symptom intensity move together — tracking both reveals your personal pattern.",
    "cycle.references.title": "References & academic sources",
    "cycle.references.disclaimer": "These sources inform FibroCare's educational content. They are not medical advice — hormonal contraception and HRT change individual experiences considerably, so discuss hormonal decisions with your care team.",
    "cycle.ref.cdc": "CDC — Fibromyalgia",
    "cycle.ref.cdc.detail": "Federal public-health guidance on symptoms, triggers, and management.",
    "cycle.ref.niams": "NIAMS (NIH) — Fibromyalgia",
    "cycle.ref.niams.detail": "National Institute of Arthritis and Musculoskeletal and Skin Diseases overview.",
    "cycle.ref.acr": "American College of Rheumatology",
    "cycle.ref.acr.detail": "ACR diagnostic criteria and rheumatology clinical guidance.",
    "cycle.ref.cochrane": "Cochrane Library",
    "cycle.ref.cochrane.detail": "Systematic reviews of chronic pain and hormonal-correlation evidence.",
    "cycle.overview.title": "What the research shows",
    "cycle.overview.content": "Studies of menstruating women with fibromyalgia consistently report symptom intensification premenstrually and during menstruation. The proposed mechanism is the luteal drop in estrogen and progesterone reducing serotonergic and noradrenergic pain inhibition, unmasking the central sensitization that characterizes fibromyalgia. Findings vary between individuals — some report strong cyclical patterns, others none — which is exactly why personal tracking matters more than population averages.",
    "cycle.overview.plain": "Most women with fibromyalgia feel worse just before and during their period. Falling hormones are the likely reason. Your own pattern may differ, so tracking beats guessing.",
    "cycle.tracking.title": "Using FibroCare's cycle tools",
    "cycle.tracking.content": "Log each cycle's start date in the dashboard's cycle tracker. After one logged cycle the correlations feed derives your current phase; after a few, the flare forecast estimates your personal risk window (cycle days, countdown, and severity) and pairs it with proactive advice. Logging symptoms daily sharpens both the correlations and the forecast.",
    "cycle.tracking.plain": "Add your period start dates in the dashboard. The app learns your rhythm and warns you a few days early so you can plan around the flare window.",
    "cycleTracker.title": "Cycle Symptom Tracker",
    "cycleTracker.subtitle": "How fibromyalgia symptoms typically shift across your cycle phases — and how to work with each one",
    "cycleTracker.logCta": "Log today's symptoms",
    "cycleTracker.insightLabel": "Coping insight",
    "cycleTracker.insightShort": "Insight",
    "cycleTracker.symptomChip.ache": "Muscle ache",
    "cycleTracker.symptomChip.sleep": "Sleep",
    "cycleTracker.symptomChip.fog": "Brain fog",
    "cycleTracker.symptomChip.fatigue": "Fatigue",
    "cycleTracker.disclaimer": "This is a general pattern, not a substitute for medical advice — every body responds differently.",
    "cycleTracker.symptom.menstrual": "During menstruation, estrogen and progesterone drop sharply — central pain sensitivity rises, which is why muscle aches and joint pain often feel worse than the rest of the month. Fatigue also tends to peak, partly from sleep fragmentation alongside the hormonal shift.",
    "cycleTracker.symptom.follicular": "As estrogen climbs after bleeding stops, serotonin and norepinephrine settle back down — the pain burden is often at its lightest and you may feel more energetic. This is usually the window where gentle movement and heat therapy are most effective.",
    "cycleTracker.symptom.ovulatory": "Mid-cycle, estrogen peaks then drops quickly — this can cause a short-lived swing that affects energy and focus more than pain itself. Many people with fibromyalgia notice a brief window of clarity, then fatigue starts to creep back in.",
    "cycleTracker.symptom.luteal": "In the second half of the cycle, progesterone rises then falls — this is the stretch where pain often begins climbing, stiffness settles in, and fatigue increases. Pacing and heat therapy become more important here.",
    "cycleTracker.symptom.window": "The pre-period window (roughly 3–7 days before bleeding): this phase is associated with the sharpest swing in pain sensitivity, fatigue, and mental exhaustion for many people with fibromyalgia — and it is the window FibroCare aims to flag early once your cycle data is in.",
    "cycleTracker.insight.menstrual": "Plan heavy tasks earlier in the month. This is a rest-friendly phase — prioritise heat therapy, gentle stretching, and sleep hygiene rather than pushing through.",
    "cycleTracker.insight.follicular": "This is the best window for gentle walking and movement in your range — energy is often better and the body responds to motion more easily.",
    "cycleTracker.insight.ovulatory": "Expect a brief energy and focus swing. Don't chase it — take short breaks and schedule the heavy tasks around your genuine peak, not the calendar.",
    "cycleTracker.insight.luteal": "Start pacing now — lower the intensity, use heat therapy before the ache kicks in, and watch your sleep closely.",
    "cycleTracker.insight.window": "This is the window where planning ahead makes the difference — use the flare forecast in the app to back off before it starts, and remember this phase is temporary.",
    "diagnosis.check.title": "AI Diagnostic Readiness Checker",
    "diagnosis.check.subtitle": "Answer 4 quick questions to see how your symptoms compare with the ACR criteria — then export a summary for your doctor.",
    "diagnosis.check.q.widespread": "Widespread pain in many body areas, on both sides, above and below the waist?",
    "diagnosis.check.q.severity": "Fatigue, unrefreshing sleep, or cognitive difficulty?",
    "diagnosis.check.q.duration": "Have symptoms lasted at least 3 months?",
    "diagnosis.check.q.exclusion": "Has your doctor ruled out other disorders that could explain the pain?",
    "diagnosis.check.yes": "Yes",
    "diagnosis.check.no": "No",
    "diagnosis.check.assess": "Check readiness",
    "diagnosis.check.verdict.likely": "Your answers align closely with the ACR criteria.",
    "diagnosis.check.verdict.possible": "Partially aligned — worth discussing with your doctor.",
    "diagnosis.check.verdict.unlikely": "Fewer criteria met — still worth a doctor's review.",
    "diagnosis.check.criteriaLabel": "ACR criteria met",
    "diagnosis.check.summaryTitle": "Summary for your doctor",
    "diagnosis.check.summary.line1": "Widespread pain in many areas: {answer}",
    "diagnosis.check.summary.line2": "Fatigue, unrefreshing sleep, or cognitive difficulty: {answer}",
    "diagnosis.check.summary.line3": "Symptoms lasting at least 3 months: {answer}",
    "diagnosis.check.summary.line4": "Other disorders ruled out: {answer}",
    "diagnosis.check.copy": "Copy summary",
    "diagnosis.check.copied": "Copied!",
    "diagnosis.check.downloadPdf": "Download PDF",
    "diagnosis.check.disclaimer": "This is a screening aid, not a diagnosis. Only a doctor can diagnose fibromyalgia.",
    "diagnosis.check.printHint": "Complete the check above, then print again to get your summary sheet.",
    "treatment.title": "Treatment & Self-Care",
    "treatment.subtitle": "Medical treatment alongside day-to-day adjustments.",
    "treatment.medications": "Medications",
    "treatment.therapy": "Physical Therapy",
    "treatment.exercise": "Exercise",
    "treatment.stress": "Stress Management",
    "treatment.sleep": "Sleep Hygiene",
    "treatment.selfCare": "Self-Care Strategies",
    "treatment.medicationsContent": "Medications are used to reduce pain and improve sleep. Common medications include:\n\nDuloxetine (Cymbalta): An antidepressant that helps reduce chronic pain.\n\nPregabalin (Lyrica): An anticonvulsant that reduces pain signals.\n\nMilnacipran (Savella): An antidepressant specifically for fibromyalgia.\n\nAcetaminophen or NSAIDs: Can help with mild pain relief.\n\nWork with your doctor to find the right medication and dosage.",
    "treatment.medicationsPlain": "Medicine can help with pain and sleep. Common options include certain antidepressants (like duloxetine), certain nerve-pain drugs (like pregabalin), and simple painkillers. What works is different for everyone — your doctor will help you find the right fit.",
    "treatment.therapyContent": "Physical therapy plays an important role in managing fibromyalgia:\n\nProgressive exercises: Gradually strengthening muscles while avoiding strain.\n\nStretching: Improving flexibility and reducing morning stiffness.\n\nWarm water therapy: Easing pain and improving movement.\n\nManual therapy: Hands-on techniques to reduce muscle tension.\n\nPhysical therapy can teach you techniques to reduce pain and improve daily function.",
    "treatment.therapyPlain": "Physical therapy helps you move better without overdoing it: building strength slowly, stretching, warm-water sessions, and learning safe everyday movements.",
    "treatment.exerciseContent": "Regular gentle exercise is one of the most effective treatments:\n\nWalking: A low-impact activity you can customize to your ability.\n\nSwimming: Excellent because water supports your body and reduces pressure.\n\nYoga: Combines movement, breathing, and relaxation.\n\nStretching: Reduces stiffness and improves flexibility.\n\nTai Chi: Slow, deliberate movements that improve balance and flexibility.\n\nStart slowly and gradually increase your activity level.",
    "treatment.exercisePlain": "Gentle, regular exercise is one of the most helpful treatments. Try walking, swimming, yoga, stretching, or tai chi. Start small and build up slowly.",
    "treatment.stressContent": "Stress management is essential because stress can worsen symptoms:\n\nMeditation and deep breathing: Simple techniques you can practice daily.\n\nCognitive Behavioral Therapy (CBT): Helps change negative thought patterns.\n\nTime management: Avoiding overload and setting priorities.\n\nSocial support: Connecting with friends, family, and community.\n\nCreative outlets: Writing, music, and arts.",
    "treatment.stressPlain": "Stress makes symptoms worse, so calming habits help: meditation, deep breathing, CBT-style thinking, planning your day to avoid overload, and staying connected with people.",
    "treatment.sleepContent": "Improving sleep quality is essential for rest and recovery:\n\nConsistent sleep routine: Go to bed and wake up at the same time.\n\nComfortable environment: Dark, cool, and quiet room.\n\nAvoid caffeine: Especially in the evening.\n\nPre-sleep relaxation: Reading or listening to calming music.\n\nScreen limits: Reduce screen time before bed.",
    "treatment.sleepPlain": "Better sleep helps everything else. Keep a regular sleep time, make your room dark, cool, and quiet, skip caffeine in the evening, wind down before bed, and limit screens.",
    "treatment.selfCareContent": "Self-care strategies help you manage your symptoms daily:\n\nPacing: Break large tasks into smaller parts.\n\nScheduled rest: Take regular breaks before you feel exhausted.\n\nTracking: Monitor symptoms and triggers.\n\nWarm therapy: Use warm packs or warm baths.\n\nHeat management: Wear layers to maintain body temperature.",
    "treatment.selfCarePlain": "Small daily habits add up: break big tasks into smaller steps, rest before you're exhausted, track your symptoms, use warmth for sore muscles, and dress in layers to stay warm.",
    "nutrition.title": "Nutrition",
    "nutrition.subtitle": "What you eat can significantly impact your fibromyalgia symptoms.",
    "nutrition.goodFoods": "Foods That Help",
    "nutrition.triggers": "Common Triggers",
    "nutrition.recipes": "Meal Ideas",
    "nutrition.hydration": "Hydration",
    "nutrition.goodFoodsContent": "Foods that may help reduce symptoms:\n\nFatty fish (salmon, sardines, tuna): Rich in omega-3 fatty acids that reduce inflammation.\n\nColorful fruits and vegetables: Packed with antioxidants.\n\nNuts and seeds: Healthy source of fats and protein.\n\nWhole grains: Provide sustained energy.\n\nFermented foods (yogurt, kimchi): Support gut health.\n\nOlive oil: Healthy monounsaturated fats.",
    "nutrition.goodFoodsPlain": "Foods that may help: fatty fish like salmon and sardines (omega-3), colorful fruits and vegetables, nuts and seeds, whole grains, fermented foods like yogurt, and olive oil.",
    "nutrition.goodFoodsHighlight.1": "Salmon and sardines",
    "nutrition.goodFoodsHighlight.2": "Colorful fruits and vegetables",
    "nutrition.goodFoodsHighlight.3": "Nuts and whole grains",
    "nutrition.triggersContent": "Foods that may worsen symptoms:\n\nProcessed foods: Contain ingredients that may increase inflammation.\n\nAdded sugars: Cause energy level fluctuations.\n\nCaffeine: Can worsen pain and interfere with sleep.\n\nAlcohol: Impairs sleep quality and causes dehydration.\n\nArtificial colors and additives: May increase sensitivity.\n\nFatty foods: May increase inflammation.\n\nCold foods: May contain triggering ingredients.",
    "nutrition.triggersPlain": "Some foods can make symptoms worse: highly processed foods, added sugar, caffeine, alcohol, artificial additives, and heavy fatty meals. Everyone is different — notice how your body reacts.",
    "nutrition.recipesContent": "Fibromyalgia-friendly meal ideas:\n\nBreakfast: Oatmeal with nuts, fresh fruit, and yogurt.\n\nLunch: Grilled salmon salad with brown rice and vegetables.\n\nDinner: Grilled chicken breast with sweet potato and broccoli.\n\nSnacks: Nuts, vegetables with hummus.\n\nBeverages: Green tea or warm ginger tea.\n\nJuices: Fresh orange and carrot juice.",
    "nutrition.recipesPlain": "Easy meal ideas: oatmeal with nuts and fruit for breakfast, grilled salmon salad for lunch, chicken with sweet potato and broccoli for dinner, and nuts or veggies with hummus for snacks.",
    "nutrition.hydrationContent": "Hydration is essential for managing fibromyalgia symptoms:\n\nAim for 8-10 glasses of water daily.\n\nWarm water with lemon can help with digestion.\n\nDrink water regularly instead of large amounts at once.\n\nAvoid sugary sodas and juices with added sugar.\n\nGreen tea or herbal tea can be a healthy alternative.\n\nMonitor urine color to ensure adequate hydration.",
    "nutrition.hydrationPlain": "Staying hydrated supports energy and focus. Aim for 8-10 glasses of water a day, sip steadily, and swap sugary drinks for water or herbal tea.",
    "exercises.title": "Exercises",
    "exercises.subtitle": "Gentle, consistent movement is key to managing fibromyalgia pain and stiffness.",
    "exercises.stretching": "Gentle Stretching",
    "exercises.yoga": "Restorative Yoga",
    "exercises.walking": "Low-Impact Walking",
    "exercises.swimming": "Aquatic Exercise",
    "exercises.tips": "Exercise Tips",
    "exercises.stretchingContent": "Gentle stretching reduces stiffness and improves flexibility:\n\nNeck stretch: Slowly tilt your head to each side, hold for 15-30 seconds.\n\nShoulder stretch: Roll your shoulders up and back slowly.\n\nLower back stretch: Sit on the edge of a chair and lean forward gently.\n\nHamstring stretch: Stand and hold one foot behind you.\n\nCalf stretch: Stand facing a wall and gently push against it.\n\nDuration: Hold each stretch for 15-30 seconds, repeat 2-3 times.\n\nBreathe deeply during each stretch.",
    "exercises.stretchingPlain": "Gentle stretching eases stiffness: tilt your head side to side, roll your shoulders, lean forward from a chair for your lower back, and stretch your calves against a wall. Hold each for 15-30 seconds and breathe deeply.",
    "exercises.stretchingHighlight.1": "15-30 seconds per stretch",
    "exercises.stretchingHighlight.2": "Breathe deeply",
    "exercises.stretchingHighlight.3": "Move slowly",
    "exercises.yogaContent": "Restorative yoga is excellent for fibromyalgia:\n\nChild's Pose: Rest on your knees with arms extended forward.\n\nCat-Cow: Slowly move between arching and rounding your back.\n\nTree Pose: Stand on one foot for balance.\n\nSide stretch: Stand and lean sideways slowly.\n\nHappy Baby Pose: Lie on your back with knees raised.\n\nBreathing exercises: Simple breathing techniques for relaxation.\n\nMovements should be gentle and pain-free.",
    "exercises.yogaPlain": "Restorative yoga is very gentle: Child's Pose, Cat-Cow, Tree Pose, and Happy Baby. Move slowly, breathe, and never push into pain.",
    "exercises.walkingContent": "Low-impact walking is excellent for daily exercise:\n\nStart with 5-10 minutes daily.\n\nGradually increase duration by 1-2 minutes per week.\n\nAim for 20-30 minutes per session.\n\nFlat surfaces are best when starting.\n\nWear comfortable, supportive shoes.\n\nUse a walking cane if needed.\n\nWalking in early morning or evening avoids heat.\n\nListen to your body and stop if you feel pain.",
    "exercises.walkingPlain": "Walking is a great low-impact start: begin with 5-10 minutes a day, add a minute or two each week, aim for 20-30 minutes, wear comfy shoes, and stop if it hurts.",
    "exercises.swimmingContent": "Aquatic exercise is excellent for fibromyalgia:\n\nWarm water (84-88°F) is soothing for muscles.\n\nWater walking: Walking in chest-deep water.\n\nWater stretching: Gentle movements in water.\n\nLight swimming: Swimming with easy strokes.\n\nWarm pool exercises: In a heated pool.\n\nDuration: Start with 10-15 minutes and gradually increase.\n\nSwimming reduces joint pressure and improves flexibility.",
    "exercises.swimmingPlain": "Water exercise is easy on your joints: warm water (84-88°F) soothes muscles. Try water walking, gentle stretching, or light swimming for 10-15 minutes and build up gradually.",
    "exercises.tipsContent": "Important tips for exercising with fibromyalgia:\n\nStart slowly: Begin with short sessions and increase gradually.\n\nListen to your body: Stop if you feel more pain than usual.\n\nConsistency over intensity: Regular gentle exercise is better than intense workouts.\n\nRest after exercise: Take adequate time to recover.\n\nStretch before and after: Always stretch before and after exercise.\n\nAvoid exercise during flare-ups.\n\nDrink water regularly.\n\nTalk to your doctor before starting any new exercise program.",
    "exercises.tipsPlain": "Golden rules: start slowly, listen to your body, stay consistent rather than intense, rest afterward, stretch before and after, skip flare days, and talk to your doctor before starting.",
    "treatment.tag.meds.1": "Follow your doctor's dose",
    "treatment.tag.meds.2": "Report side effects",
    "treatment.tag.therapy.1": "First-line options",
    "treatment.tag.therapy.2": "Combine with exercise",
    "treatment.tag.exercise.1": "Start small, build slowly",
    "treatment.tag.exercise.2": "Consistency beats intensity",
    "treatment.tag.stress.1": "Daily 5-minute practice",
    "treatment.tag.stress.2": "CBT-style thinking helps",
    "treatment.tag.sleep.1": "Same wake time daily",
    "treatment.tag.sleep.2": "No screens before bed",
    "treatment.tag.selfCare.1": "Pace your day",
    "treatment.tag.selfCare.2": "Rest before exhaustion",
    "treatment.quickAdd.title": "Add to today's tracker",
    "treatment.quickAdd.subtitle": "Log what you did today — it appears in your health log.",
    "treatment.quickAdd.added": "Added to today's log",
    "treatment.quickAdd.error": "Couldn't save — please try again",
    "treatment.quickAdd.signIn": "Sign in to save tracker entries",
    "treatment.quickAdd.item.pacing": "Pacing — broke a task into steps",
    "treatment.quickAdd.item.rest": "Scheduled rest break",
    "treatment.quickAdd.item.warm": "Warm therapy (pack or bath)",
    "treatment.quickAdd.item.hydration": "Drank water steadily",
    "treatment.quickAdd.item.movement": "Gentle movement session",
    "treatment.quickAdd.item.medication": "Medication (as prescribed)",
    "nutrition.tag.goodFoods.1": "Omega-3 rich",
    "nutrition.tag.goodFoods.2": "Antioxidant-packed",
    "nutrition.tag.triggers.1": "Everyone is different",
    "nutrition.tag.triggers.2": "Keep a food diary",
    "nutrition.tag.recipes.1": "Simple & balanced",
    "nutrition.tag.recipes.2": "Prep in advance",
    "nutrition.tag.hydration.1": "Sip steadily",
    "nutrition.tag.hydration.2": "Check urine color",
    "nutrition.bookmark.title": "Safe foods you trust",
    "nutrition.bookmark.subtitle": "Bookmark what works for you — saved on this device.",
    "nutrition.bookmark.savedCount": "{count} bookmarked",
    "nutrition.bookmark.food.fish": "Fatty fish (salmon, sardines)",
    "nutrition.bookmark.food.fruits": "Colorful fruits & vegetables",
    "nutrition.bookmark.food.nuts": "Nuts & seeds",
    "nutrition.bookmark.food.wholeGrains": "Whole grains",
    "nutrition.bookmark.food.fermented": "Yogurt & fermented foods",
    "nutrition.bookmark.food.oliveOil": "Olive oil",
    "nutrition.swap.title": "Trigger swaps",
    "nutrition.swap.subtitle": "Can't avoid a trigger? Try a gentler swap.",
    "nutrition.swap.suggest": "Suggest swap",
    "nutrition.swap.suggested": "Try this instead",
    "nutrition.swap.because": "Why it helps",
    "nutrition.swap.trigger.sugar": "Added sugar",
    "nutrition.swap.trigger.caffeine": "Caffeine",
    "nutrition.swap.trigger.alcohol": "Alcohol",
    "nutrition.swap.trigger.processed": "Processed foods",
    "nutrition.swap.trigger.sodas": "Sugary sodas & juices",
    "nutrition.swap.item.sugar": "Fresh fruit or dates",
    "nutrition.swap.item.caffeine": "Decaf herbal tea (chamomile, ginger)",
    "nutrition.swap.item.alcohol": "Sparkling water with lemon",
    "nutrition.swap.item.processed": "Whole-food snack (nuts, hummus, fruit)",
    "nutrition.swap.item.sodas": "Water or herbal tea",
    "nutrition.swap.reason.sugar": "Natural sweetness with fiber — no energy crash.",
    "nutrition.swap.reason.caffeine": "Calms without disturbing sleep.",
    "nutrition.swap.reason.alcohol": "Hydrates and protects sleep quality.",
    "nutrition.swap.reason.processed": "Fewer additives, steadier energy.",
    "nutrition.swap.reason.sodas": "Hydration without added sugar.",
    "exercises.tag.stretching.1": "Hold 15-30 seconds",
    "exercises.tag.stretching.2": "Never push into pain",
    "exercises.tag.yoga.1": "Restorative poses",
    "exercises.tag.yoga.2": "Use props for support",
    "exercises.tag.walking.1": "Start with 5-10 minutes",
    "exercises.tag.walking.2": "Flat surfaces",
    "exercises.tag.swimming.1": "Warm water",
    "exercises.tag.swimming.2": "Gentle on joints",
    "exercises.tag.tips.1": "Listen to your body",
    "exercises.tag.tips.2": "Rest between sessions",
    "exercises.timer.start": "Start",
    "exercises.timer.pause": "Pause",
    "exercises.timer.reset": "Reset",
    "exercises.timer.done": "Done — great work",
    "exercises.timer.aria": "Countdown timer, {time} remaining",
    "exercises.timer.spoons.one": "1 Spoon",
    "exercises.timer.spoons.many": "{count} Spoons",
    "exercises.timer.stretchingLabel": "Stretching session",
    "exercises.timer.walkingLabel": "Walking session",
    "stretching.intro": "A gentle 15-minute routine to ease tension and improve flexibility. Move slowly, breathe deeply, and never push past mild discomfort.",
    "stretching.tipsTitle": "General Stretching Tips",
    "stretching.tipsBody": "Always warm up for 2-3 minutes before stretching. Hold each stretch for 15-30 seconds without bouncing. Breathe deeply and relax into each movement. Stop immediately if you feel sharp pain.",
    "stretching.neck.title": "Neck Rolls",
    "stretching.neck.steps": "Sit upright in a chair with shoulders relaxed.\nSlowly tilt your head toward your right shoulder.\nHold for 5 seconds, feeling a gentle stretch on the left side.\nReturn to center and repeat on the left side.\nPerform 3 rolls in each direction.",
    "stretching.neck.duration": "2 min",
    "stretching.shoulder.title": "Shoulder Shrugs",
    "stretching.shoulder.steps": "Sit or stand with arms at your sides.\nInhale and raise both shoulders toward your ears.\nHold for 3 seconds, feeling the tension release.\nExhale and slowly lower your shoulders.\nRepeat 8-10 times.",
    "stretching.shoulder.duration": "2 min",
    "stretching.lowerBack.title": "Seated Cat-Cow",
    "stretching.lowerBack.steps": "Sit on a chair with feet flat on the floor, hands on knees.\nArch your back gently, looking up (Cow pose).\nHold for 3 seconds.\nRound your spine, tucking your chin (Cat pose).\nHold for 3 seconds and repeat 5 times.",
    "stretching.lowerBack.duration": "3 min",
    "stretching.thigh.title": "Standing Quad Stretch",
    "stretching.thigh.steps": "Stand near a wall or chair for balance.\nBend your right knee, bringing your heel toward your glutes.\nGently hold your ankle with your right hand.\nKeep your knees close together and stand tall.\nHold for 20 seconds, then switch legs.",
    "stretching.thigh.duration": "2 min",
    "stretching.calf.title": "Wall Calf Stretch",
    "stretching.calf.steps": "Stand facing a wall, about arm's length away.\nStep your right foot back, keeping it flat on the floor.\nLean forward gently, pressing your hands against the wall.\nYou should feel a stretch in your right calf.\nHold for 20 seconds and switch sides.",
    "stretching.calf.duration": "2 min",
    "logging.mood.selfCare": "Self-Care",
    "faq.title": "Frequently Asked Questions",
    "faq.subtitle": "Answers to common questions about living with fibromyalgia.",
    "faq.chronic": "Is fibromyalgia a chronic condition?",
    "faq.chronicAnswer": "Yes, fibromyalgia is considered a chronic (long-term) condition. However, symptoms can fluctuate over time, with periods of flare-ups and remission. Many people learn to manage their symptoms effectively with the right treatment plan and lifestyle adjustments.",
    "faq.cure": "Is there a cure for fibromyalgia?",
    "faq.cureAnswer": "Currently, there is no known cure for fibromyalgia. However, a combination of medication, therapy, exercise, stress management, and lifestyle changes can significantly reduce symptoms and improve quality of life. Ongoing research continues to explore new treatment approaches.",
    "faq.pregnancy": "Does fibromyalgia affect pregnancy?",
    "faq.pregnancyAnswer": "Fibromyalgia does not typically cause complications during pregnancy, but symptoms may change. Some women experience improvement during pregnancy, while others may have increased pain or fatigue. It is important to work with your healthcare provider to manage symptoms safely during pregnancy.",
    "faq.exercise": "Is exercise safe with fibromyalgia?",
    "faq.exerciseAnswer": "Yes, gentle exercise is actually one of the most effective treatments for fibromyalgia. Low-impact activities like walking, swimming, stretching, and yoga can reduce pain, improve sleep, and boost mood. Start slowly, listen to your body, and gradually increase activity levels.",
    "faq.diagnosis": "How long does diagnosis take?",
    "faq.diagnosisAnswer": "Diagnosis can take time because fibromyalgia symptoms overlap with many other conditions. On average, it may take several months to years from symptom onset to diagnosis. Keeping a symptom diary and seeking evaluation from a rheumatologist can help speed the process.",
    "faq.treatment": "What treatments work best?",
    "faq.treatmentAnswer": "The most effective approach is typically multimodal, combining medications (such as duloxetine or pregabalin), physical therapy, regular gentle exercise, cognitive behavioral therapy (CBT), and stress management techniques. What works best varies from person to person, so finding the right combination often requires patience and open communication with your healthcare team.",
    "community.title": "Community",
    "community.subtitle": "A warm space for sharing experiences, tips, and support with others who understand.",
    "community.shareStory": "Share Your Story",
    "community.stories": "Patient Stories",
    "community.tips": "Peer Tips",
    "community.support": "Support & Encouragement",
    "community.writePlaceholder": "Share your experience, a helpful tip, or words of encouragement...",
    "community.postButton": "Share",
    "community.noStories": "Be the first to share your story. Your experience could help someone else feel less alone.",
    "community.loginPrompt": "Log in to share your story and connect with others.",
    "community.samplePost.1.content": "After being diagnosed, I felt alone. This community helped me realize I'm not the only one fighting this battle. Gentle yoga has been a game-changer for my morning stiffness.",
    "community.samplePost.1.time": "2 hours ago",
    "community.samplePost.2.content": "Tip: Keep a heating pad near your bed. Waking up with stiff muscles? Apply heat for 15 minutes before getting up. It makes a huge difference in my mornings.",
    "community.samplePost.2.time": "5 hours ago",
    "community.samplePost.3.content": "To anyone having a flare-up today: You are stronger than you think. This too shall pass. Be gentle with yourself. 💜",
    "community.samplePost.3.time": "1 day ago",
    "community.you": "You",
    "community.justNow": "Just now",
    "community.reply": "Reply",
    "community.likeAria": "Like ({count})",
    "community.filter.all": "All",
    "community.filter.aria": "Filter posts by category",
    "community.translate": "Translate",
    "community.translated": "Show original",
    "faq.searchPlaceholder": "Ask a question… (e.g. heat therapy for stiffness)",
    "faq.searchAria": "Search frequently asked questions",
    "faq.searchClear": "Clear search",
    "faq.noMatch": "No answers match your question",
    "faq.noMatchHint": "Try words like exercise, diagnosis, or treatment.",
    "dashboard.greeting.morning": "Good morning",
    "dashboard.greeting.afternoon": "Good afternoon",
    "dashboard.greeting.evening": "Good evening",
    "dashboard.todayMessage": "Take a moment to check in with your body today.",
    "dashboard.streakAria": "{count} day logging streak",
    "dashboard.streakDays": "day streak",
    "dashboard.checkin.title": "How are you feeling today?",
    "dashboard.checkin.subtitle": "Tracking your energy and symptoms helps manage flares and improve care.",
    "dashboard.energy.title": "How is your energy today?",
    "dashboard.energy.goodDay": "Good Day",
    "dashboard.energy.lowEnergy": "Low Energy",
    "dashboard.energy.flareUp": "Flare-up",
    "dashboard.symptoms.label": "Symptoms & Notes (Optional)",
    "dashboard.symptoms.placeholder": "How are you feeling specifically? Any triggers or symptoms?",
    "dashboard.save.saving": "Saving...",
    "dashboard.save.submit": "Log Today's Entry",
    "dashboard.save.success": "Log saved successfully!",
    "dashboard.support.title": "Gentle Support",
    "dashboard.support.subtitle": "Quick tools to soothe your nervous system and lift your mood.",
    "dashboard.weekly.title": "Weekly Progress",
    "dashboard.loading": "Loading…",
    "dashboard.noCycleData": "No cycle data yet.",
    "health.recommendations.empty": "No recommendations yet — keep logging to unlock insights.",
    "health.recommendations.noSymptoms": "Log a few symptoms and pain check-ins — insights appear once patterns emerge.",
    "health.recommendations.noCycle": "Log your menstrual cycle to unlock hormonal correlation insights.",
    "health.recommendations.highPriority": "High priority",
    "health.forecast.levelHigh": "High flare risk",
    "health.forecast.levelModerate": "Moderate risk",
    "health.forecast.levelLow": "Low risk",
    "health.forecast.advice.pacing": "Pace yourself — schedule short rest breaks before the window opens.",
    "health.forecast.advice.heat": "Keep a heat pad nearby; warmth eases pre-period muscle tension.",
    "health.forecast.advice.sleep": "Protect your sleep — fatigue amplifies flare sensitivity.",
    "health.forecast.advice.hydrate": "Stay hydrated and limit caffeine in the days ahead.",
    "health.forecast.advice.gentleMovement": "Gentle movement (short walks, stretching) helps without pushing.",
    "health.forecast.advice.trackDaily": "Log daily so the forecast sharpens with every cycle.",
    "health.forecast.noCycleGuidance": "Log your menstrual cycle once to unlock your personal flare forecast.",
    "health.forecast.title": "Flare Forecast",
    "health.forecast.periodNow": "Period expected now",
    "health.forecast.periodIn": "Period in ~{{days}} days",
    "health.forecast.inWindow": "Days {{start}}–{{end}} of this cycle are your elevated-risk window — go gently.",
    "health.forecast.windowAhead": "Risk window opens in ~{{days}} days (cycle days {{start}}–{{end}}).",
    "health.forecast.calmHigh": "Energy protection mode — rest is your strength today.",
    "health.forecast.calmModerate": "Gentle balance — short rests keep your momentum steady.",
    "health.forecast.calmLow": "Calm baseline — your body is in a steady, resilient rhythm.",
    "health.forecast.calmCta": "Open a calm session",
    "health.cycle.emptyGuidance": "No cycle logged yet. Adding it lets the engine link hormonal phases to brain fog, mood and pain.",
    "health.cycle.logCta": "Log cycle",
    "health.cycle.saveCta": "Save cycle",
    "health.cycle.saveError": "Could not save the cycle. Please try again.",
    "health.cycle.startDateAria": "Cycle start date",
    "health.cycle.phaseAria": "Cycle phase",
    "health.phase.menstrual": "Menstrual",
    "health.phase.follicular": "Follicular",
    "health.phase.ovulatory": "Ovulatory",
    "health.phase.luteal": "Luteal",
    "health.phase.unknown": "Unknown phase",
    "health.flareWindow": "Flare window",
    "health.currentDay": "Current day",
    "health.flareRisk": "Flare risk",
    "health.symptomMap.title": "Symptom Map",
    "health.symptomMap.quickLog": "Quick log",
    "health.category.physical": "Physical",
    "health.category.cognitive": "Cognitive",
    "health.category.mood": "Mood",
    "health.quickLog.brainFog": "Brain Fog",
    "health.quickLog.focusFatigue": "Focus Fatigue",
    "health.quickLog.jointPain": "Joint Pain",
    "health.quickLog.emotionalExhaustion": "Emotional Exhaustion",
    "health.doctorSummaryTitle": "Analytical Health Summary",
    "health.correlationAlerts": "Correlation Alerts",
    "health.topHotspots": "Top Hotspots",
    "health.categoryAverages": "Category Averages",
    "health.physical": "Physical",
    "health.cognitive": "Cognitive",
    "health.mood": "Mood",
    "health.area.pelvic": "Pelvic",
    "health.area.lower_back": "Lower back",
    "health.area.widespread": "Widespread",
    "health.area.joints": "Joints",
    "health.area.other": "Other",
    "health.menstrualLog.title": "Daily Cycle Log",
    "health.menstrualLog.flow.title": "Flow Intensity",
    "health.menstrualLog.flow.spotting": "Spotting",
    "health.menstrualLog.flow.light": "Light",
    "health.menstrualLog.flow.medium": "Medium",
    "health.menstrualLog.flow.heavy": "Heavy",
    "health.menstrualLog.flow.hasClots": "Blood Clots",
    "health.menstrualLog.flow.color": "Flow Color",
    "health.menstrualLog.somatic.title": "Fibro-Somatic Symptoms",
    "health.menstrualLog.somatic.cramps": "Cramps Severity",
    "health.menstrualLog.somatic.headache": "Headache Severity",
    "health.menstrualLog.somatic.breastTenderness": "Breast Tenderness",
    "health.menstrualLog.somatic.bloating": "Bloating",
    "health.menstrualLog.gi.title": "Digestive & Inflammation",
    "health.menstrualLog.gi.diarrhea": "Diarrhea",
    "health.menstrualLog.gi.constipation": "Constipation",
    "health.menstrualLog.gi.acne": "Hormonal Acne",
    "health.menstrualLog.fertility.title": "Ovulation & Fertility Signs",
    "health.menstrualLog.fertility.cervicalMucus": "Cervical Mucus",
    "health.menstrualLog.fertility.opk": "OPK Result",
    "health.menstrualLog.mood.title": "Mood & Emotional Sharpness",
    "health.menstrualLog.mood.tearfulness": "Tearfulness",
    "health.menstrualLog.mood.anxiety": "Anxiety Level",
    "health.menstrualLog.mood.volatility": "Mood Volatility",
    "health.menstrualLog.mucus.dry": "Dry",
    "health.menstrualLog.mucus.sticky": "Sticky",
    "health.menstrualLog.mucus.creamy": "Creamy",
    "health.menstrualLog.mucus.watery": "Watery",
    "health.menstrualLog.mucus.eggWhite": "Egg-white",
    "health.menstrualLog.opk.negative": "Negative",
    "health.menstrualLog.opk.positive": "Positive",
    "health.menstrualLog.opk.notUsed": "Not used",
    "health.menstrualLog.sensory.none": "None",
    "health.menstrualLog.sensory.mild": "Mild",
    "health.menstrualLog.sensory.moderate": "Moderate",
    "health.menstrualLog.sensory.severe": "Severe",
    "health.menstrualLog.notesLabel": "Notes",
    "health.menstrualLog.energy.title": "Daily Bio-Energy",
    "health.menstrualLog.libido.title": "Libido & Vitality",
    "health.menstrualLog.sensory.title": "Sensory Overload",
    "health.menstrualLog.sensory.light": "Light Sensitivity",
    "health.menstrualLog.sensory.sound": "Sound Sensitivity",
    "health.menstrualLog.saveCta": "Save daily log",
    "health.menstrualLog.savedOk": "Daily log saved — your correlation map just got sharper.",
    "health.menstrualLog.saveError": "Could not save the daily log. Please try again.",
    "health.menstrualLog.noActiveCycle": "No active cycle yet",
    "health.menstrualLog.createCycleFirst": "Create a cycle first — the daily log links to your current cycle phase.",
    "health.overlap.title": "Fibro-Hormonal Overlap Score",
    "health.overlap.hormonal": "Hormonal amplification",
    "health.overlap.physical": "Physical exertion",
    "health.overlap.noData": "Log a few days to reveal your hormonal flare split.",
    "health.carePlan.title": "Phase-Based Care Plan",
    "health.carePlan.diet": "Diet",
    "health.carePlan.supplements": "Supplements",
    "health.carePlan.pacing": "Pacing",
    "health.carePlan.currentPhase": "Current phase",
    "health.carePlan.diet.menstrual": "Prioritize iron-rich foods and warm, easily-digested meals; gentle soups reduce cramping load.",
    "health.carePlan.diet.follicular": "Energy rises — favor lean proteins, fermented foods and fresh vegetables to support hormone clearance.",
    "health.carePlan.diet.ovulatory": "Hydrate well, keep fiber high, and reduce simple sugars around the surge to steady mood.",
    "health.carePlan.diet.luteal": "Increase magnesium, complex carbs and leafy greens; lower salt and caffeine to soften PMS symptoms.",
    "health.carePlan.supplements.menstrual": "Vitamin D3 + magnesium glycinate may ease menstrual cramps — confirm the dose with your clinician.",
    "health.carePlan.supplements.follicular": "Vitamin B-complex supports estrogen metabolism; consider an iron check if flow is heavy.",
    "health.carePlan.supplements.ovulatory": "Omega-3s help quiet inflammatory peaks; keep zinc as a short luteal-support option.",
    "health.carePlan.supplements.luteal": "Magnesium + vitamin B6 are the classic luteal team for PMS mood and bloating.",
    "health.carePlan.pacing.menstrual": "Treat the first two days as a minimum rest baseline — split tasks and defer heavy exertion.",
    "health.carePlan.pacing.follicular": "This is your strongest bandwidth — schedule demanding work and exercise now.",
    "health.carePlan.pacing.ovulatory": "Great peak brain day — protect it with a mid-day micro-break and early bedtime.",
    "health.carePlan.pacing.luteal": "Shrink your to-do list, add 10-minute rests, and keep movement gentle (walks, stretching).",
    "health.spoonCalc.title": "Spoon Theory Energy Calculator",
    "health.spoonCalc.subtitle": "Budget your daily spoons from sleep quality and cycle phase.",
    "health.spoonCalc.budget": "Budgeted spoons",
    "health.spoonCalc.sleepQuality": "Last night's sleep quality",
    "health.spoonCalc.cycleAdjust": "Cycle phase adjustment",
    "health.spoonCalc.available": "available today",
    "health.clinicalReport.title": "Clinical Report",
    "health.clinicalReport.subtitle": "Doctor-ready correlation summary of your cycle vs symptoms.",
    "health.clinicalReport.generate": "Generate report",
    "health.clinicalReport.generating": "Generating…",
    "health.clinicalReport.periodRange": "Cycles analyzed",
    "health.clinicalReport.peakPain": "Peak pain level",
    "health.clinicalReport.avgEnergy": "Avg energy (1-10)",
    "health.clinicalReport.avgMood": "Avg mood score",
    "health.clinicalReport.symptomSummary": "Top symptom correlations",
    "health.clinicalReport.printCta": "Print / Save as PDF",
    "health.clinicalReport.emptyState": "Not enough data yet — log your cycle and symptoms for a readable report.",
    "health.caregiver.title": "Caregiver / Partner Sync",
    "health.caregiver.subtitle": "Share a read-only flare-prediction link with people who care for you.",
    "health.caregiver.enable": "Enable secure share",
    "health.caregiver.disable": "Disable share",
    "health.caregiver.shareToken": "Share link",
    "health.caregiver.copied": "Link copied to clipboard.",
    "health.caregiver.disclaimer": "Your diary entries, scores and notes stay private — only the next flare forecast is visible to the viewer.",
    "health.caregiver.viewOnly": "Read-only for the viewer",
    "dashboard.weekly.subtitle": "Your pain levels over the last 7 days.",
    "dashboard.weekly.avgPain": "Avg pain",
    "dashboard.weekly.daysLogged": "Days logged",
    "dashboard.weekly.highest": "Highest",
    "dashboard.weekly.scale": "/10",
    "dashboard.insights.title": "AI Insights",
    "dashboard.insights.subtitle": "Patterns detected from your recent logs.",
    "dashboard.insights.empty": "Log at least 5 days of pain and symptoms to get personalized insights.",
    "dashboard.toast.message": "It looks like a tough day. Would you like to switch to Calming Mode and take 3 minutes for yourself?",
    "dashboard.toast.title": "We're here with you",
    "dashboard.toast.dismissAria": "Dismiss message",
    "dashboard.toast.calming": "Calming Mode",
    "dashboard.toast.zen": "Zen Portal",
    "auth.passwordShow": "Show {label}",
    "auth.passwordHide": "Hide {label}",
    "common.close": "Close",
    "privacy.unlockDialogAria": "Enter your PIN to unlock FibroCare",
    "privacy.lockedTitle": "Your space is locked",
    "privacy.enterPin": "Enter your 4-digit PIN",
    "privacy.incorrectPin": "Incorrect PIN. Try again.",
    "privacy.digitAria": "Digit {digit}",
    "privacy.deleteDigitAria": "Delete last digit",
    "privacy.digitsEnteredAria": "{length} of {total} digits entered",
    "privacy.forgotPin": "Forgot PIN?",
    "privacy.useBiometrics": "Use Biometrics",
    "privacy.biometricScanning": "Waiting for biometric sensor…",
    "pricing.title": "FibroCare plans",
    "pricing.subtitle": "Your logs and data are always free. Pro adds the deeper AI work on top.",
    "pricing.free.name": "Free",
    "pricing.free.price": "$0",
    "pricing.free.perk1": "Unlimited pain, symptom & spoon logging",
    "pricing.free.perk2": "Body map, flare mode & somatic toolkit",
    "pricing.free.perk3": "Offline install (PWA) with local encryption",
    "pricing.free.perk4": "30/90-day PDF summary",
    "pricing.pro.badge": "Pro",
    "pricing.pro.name": "FibroCare Pro",
    "pricing.pro.price": "$6",
    "pricing.pro.period": "/ month",
    "pricing.pro.perk1": "Empathic AI Companion with your health memory",
    "pricing.pro.perk2": "Doctor-ready clinical brief & PDF export",
    "pricing.pro.perk3": "Doctor Hub: publish verified health articles",
    "pricing.pro.perk4": "Direct consultations with your doctor",
    "pricing.pro.perk5": "AI Copilot for clinical summaries & symptom structuring",
    "pricing.pro.perk6": "Time-series flare & weather predictor",
    "pricing.pro.perk7": "Guided video masterclasses",
    "pricing.upgradeCta": "Upgrade to Pro",
    "pricing.comingSoon": "Coming soon",
    "pricing.footnote": "Cancel anytime. Your health data never leaves your device unless you export it yourself.",
    "pricing.previewTitle": "This is a Pro feature",
    "pricing.previewBody": "You can see a preview here. Pro unlocks the full version, and your logs stay free either way.",
    "profile.pricing": "Upgrade · FibroCare Pro",
    "privacy.security.title": "Privacy & security",
    "privacy.security.subtitle": "Your health data stays on your device unless you export it yourself.",
    "privacy.security.encryption": "Local data encryption",
    "privacy.security.encryptionDesc": "Sensitive local entries are encrypted with AES-GCM before they are stored in this browser.",
    "privacy.security.active": "Active",
    "privacy.security.unavailable": "Unavailable",
    "privacy.security.analytics": "Opt out of analytics",
    "privacy.security.analyticsDesc": "No analytics run today, and this preference is stored so any future analytics skips you.",
    "privacy.security.export": "Export my data",
    "privacy.security.exportDesc": "Downloads an encrypted JSON copy of everything stored locally. Choose a passphrase of at least 8 characters; it never leaves this device, and the file cannot be read without it.",
    "privacy.security.passphrase": "Export passphrase (min 8 chars)",
    "privacy.security.exportBtn": "Export",
    "privacy.security.exportDone": "Encrypted export downloaded. Keep the passphrase safe; it cannot be recovered.",
    "privacy.security.exportError": "Export failed. Check that the passphrase is at least 8 characters.",
    "privacy.security.purge": "Purge all local health data",
    "privacy.security.purgeDesc": "Removes every FibroCare entry from this browser: local caches, preferences, session state, and offline files. Your language preference and server data are not affected.",
    "privacy.security.purgeBtn": "Purge now",
    "privacy.security.purgeConfirmTitle": "Delete everything FibroCare stored in this browser?",
    "privacy.security.purgeConfirmBody": "This cannot be undone. Local logs, preferences, and offline caches on this device will be gone. Your account data on the server stays.",
    "privacy.security.purged": "Removed {count} local item(s){items}.",
    "privacy.biometricFailed": "Biometric unlock failed. Please try again.",
    "privacy.resetPinTitle": "Reset privacy PIN",
    "privacy.resetPinCloseAria": "Close reset PIN dialog",
    "privacy.resetPinPrompt": "Choose a new 4-digit PIN for {email}.",
    "privacy.resetPinNew": "New PIN",
    "privacy.resetPinConfirm": "Confirm new PIN",
    "privacy.resetPinAction": "Reset PIN",
    "privacy.resetPinNotSignedIn": "You need to be signed in to reset your PIN.",
    "privacy.resetPinSignIn": "Sign in",
    "privacy.setupDialogAria": "Set a privacy PIN",
    "privacy.protectTitle": "Protect your health data",
    "privacy.choosePin": "Choose a 4-digit PIN",
    "privacy.confirmPin": "Confirm your PIN",
    "privacy.pinMismatch": "PINs did not match. Start over.",
    "quickActions.ariaLabel": "Quick actions",
    "quickActions.checkin.title": "Daily Check-in",
    "quickActions.checkin.description": "Log your energy, pain and symptoms",
    "quickActions.logs.title": "Health Logs",
    "quickActions.logs.description": "Browse your check-in history",
    "quickActions.reports.title": "Medical Reports",
    "quickActions.reports.description": "Export a summary for your care team",
    "quickActions.resources.title": "Care Resources",
    "quickActions.resources.description": "Gentle guidance and practical tips",
    "quickActions.consultations.title": "Consultations",
    "quickActions.consultations.description": "Structure symptoms and message your doctor",
    "logging.presets.ariaLabel": "Quick check-in presets",
    "logging.presets.calmDay": "Calm Day",
    "logging.presets.mildFlare": "Mild Flare",
    "logging.presets.severeFlare": "Severe Flare",
    "logging.symptoms.widespreadPain": "Widespread Pain",
    "logging.symptoms.fatigue": "Fatigue",
    "logging.symptoms.sleepProblems": "Sleep Problems",
    "logging.symptoms.fibroFog": "Fibro Fog",
    "logging.symptoms.headache": "Headache / Migraine",
    "logging.symptoms.tenderPoints": "Tender Points",
    "logging.symptoms.stiffness": "Stiffness",
    "logging.symptoms.sensitivity": "Light / Noise Sensitivity",
    "logging.symptoms.selected": "(selected)",
    "logging.slider.label": "Pain Level",
    "logging.slider.ariaLabel": "Pain level",
    "logging.slider.calm": "Calm",
    "logging.slider.moderate": "Moderate",
    "logging.slider.intense": "Intense",
    "flare.title": "Flare Emergency Mode",
    "flare.on": "On",
    "flare.off": "Off",
    "flare.activateAria": "Activate Flare Emergency Mode",
    "flare.deactivateAria": "Deactivate Flare Emergency Mode",
    "flare.dimmedMessage": "The screen is dimmed and motion stilled. You are not alone. Here are the people who can help right now.",
    "flare.armedDescription": "Tap to arm a calming, de-cluttered view with crisis resources for a severe flare.",
    "flare.suggestion": " Your latest check-in looks like a flare-up. Consider switching this on.",
    "flare.crisisOptionsAria": "Crisis support options",
    "flare.crisis.emergencyLabel": "In immediate danger? Call emergency services",
    "flare.crisis.emergencyValue": "911 (or local)",
    "flare.crisis.suicideLabel": "Crisis support for the US/Canada",
    "flare.crisis.suicideValue": "988 Suicide & Crisis Lifeline",
    "flare.crisis.samaritansLabel": "UK / Ireland Samaritans",
    "flare.crisis.samaritansValue": "116 123 (free, 24/7)",
    "today.title": "Today's Context",
    "today.liveWeather": "Live weather · {location}",
    "today.temp": "Temp",
    "today.humidity": "Humidity",
    "today.pressure": "Pressure",
    "today.impact.low": "Low pressure may increase pain sensitivity",
    "today.impact.high": "High pressure can trigger headaches",
    "today.impact.normal": "Pressure is within comfortable range",
    "today.status.stable": "Barometric pressure is stable within the comfortable range.",
    "today.status.pressureDrop": "Alert: a drop in barometric pressure may affect your joints.",
    "today.trigger.humidityHigh": "High humidity may weigh on sensitive joints today.",
    "today.trigger.heat": "Extreme heat — keep cool and stay hydrated.",
    "today.trigger.cold": "Extreme cold may increase stiffness — keep warm.",
    "today.triggers.neutral":
      "Log your daily symptoms to track weather triggers once the service is enabled.",
    "today.estimated": "Estimated values (weather API not configured).",
    "recent.title": "Recent Logs",
    "recent.empty": "No logs yet. Start tracking to see your history here.",
    "recent.today": "Today",
    "recent.painAria": "Pain level {level}",
    "recent.pain.levelLow": "Low",
    "recent.pain.levelMild": "Mild",
    "recent.pain.levelModerate": "Moderate",
    "recent.pain.levelHigh": "High",
    "recent.pain.levelSevere": "Severe",
    "quotes.quote1": "Your body is your home. Treat it with the kindness it deserves.",
    "quotes.quote2": "Rest is not laziness. It is the foundation of healing.",
    "quotes.quote3": "Every small step forward is still progress. Be gentle with yourself.",
    "quotes.quote4": "You are more than your diagnosis. Your strength defines you.",
    "quotes.quote5": "Listen to your body today. It knows what it needs.",
    "quotes.quote6": "Healing is not linear. Every bad day is followed by a better one.",
    "quotes.quote7": "You deserve compassion, especially from yourself.",
    "quotes.quote8": "Breathe in calm, breathe out tension. You are safe in this moment.",
    "quotes.quote9": "Your worth is not measured by your productivity.",
    "quotes.quote10": "Today, choose peace over perfection.",
    "quotes.quote11": "Gentle movement, gentle thoughts, gentle self-talk.",
    "quotes.quote12": "You have survived every hard day so far. You will survive this one too.",
    "quotes.author": "FibroCare",
    "medical.title": "Smart Medical Summary",
    "medical.subtitle": "Key insights, pain trends, and questions to bring to your doctor.",
    "medical.generate": "Generate Medical Summary",
    "medical.analyzing": "Analyzing…",
    "medical.avgPain": "Avg pain",
    "medical.flareDays": "Flare days",
    "medical.logs": "Logs",
    "medical.painTrend": "Pain Trend (last 7 days)",
    "medical.keyInsights": "Key Insights",
    "medical.insightsEmpty": "Keep logging. After 5 days of pain and symptoms, personalized insights show up.",
    "medical.questions": "Questions for Your Doctor",
    "medical.summaryFor": "Medical Summary for {name}",
    "medical.generated": "Generated {date}",
    "medical.close": "Close",
    "medical.error": "Could not generate your summary.",
    "medical.generatingAria": "Generating AI questions",
    "medical.question.flare": "We logged {count} flare day{plural} in the last 30 days. Could we review what may be triggering them and adjust my plan?",
    "medical.question.highPain": "My average pain has been high. Are my current medications and doses still the right fit?",
    "medical.question.fatigue": "Fatigue and sleep issues keep showing up in my logs. Can we look at energy management and sleep strategies?",
    "medical.question.sensory": "Sensory sensitivity appears in my pattern. Are there pacing or environmental changes that could reduce it?",
    "medical.question.movement": "What movement or physiotherapy level is safe for me right now without worsening symptoms?",
    "medical.question.tracking": "How should I track or log differently so our next review is even more useful?",
    "reports.pageTitle": "Medical Reports",
    "reports.pageSubtitle": "A 90-day summary of your pain, flares, symptoms, and patterns, ready for your specialist.",
    "reports.loading": "Analyzing your health data…",
    "reports.loadError": "Could not load report data.",
    "reports.snapshotAria": "Report snapshot",
    "reports.stat.avgPain": "Avg Pain · 90 days",
    "reports.stat.flareDays": "Flare-up days",
    "reports.stat.topSymptoms": "Top symptoms",
    "reports.stat.noneRecorded": "None recorded",
    "reports.stat.symptom.widespreadPain": "Widespread pain",
    "reports.stat.symptom.fatigue": "Fatigue",
    "reports.stat.symptom.sleepProblems": "Sleep problems",
    "reports.stat.symptom.fibroFog": "Fibro-fog",
    "reports.stat.symptom.headache": "Headache / Migraine",
    "reports.stat.symptom.tenderPoints": "Tender points",
    "reports.stat.symptom.stiffness": "Stiffness",
    "reports.stat.symptom.sensitivity": "Light / Noise sensitivity",
    "reports.insights.subtitle": "Data-driven observations from your logs.",
    "reports.insights.empty": "Log at least 5 days of pain and symptoms to get personalized insights.",
    "reports.insights.filterLabel": "Filter insights by severity",
    "reports.insights.none": "No insights yet. Keep logging consistently.",
    "reports.insights.noneFor": "No {filter} insights right now.",
    "reports.severity.critical": "Critical",
    "reports.severity.warning": "Watch",
    "reports.severity.info": "Note",
    "reports.brief.title": "AI Clinical Executive Brief (30 days)",
    "reports.brief.subtitle": "A one-page snapshot of your trends, prepared in clinical language for your care team.",
    "reports.brief.flareFrequency": "Flare frequency",
    "reports.brief.flareDaysUnit": "flare day(s)",
    "reports.brief.velocity": "Symptom velocity",
    "reports.brief.functional": "Functional capacity",
    "reports.brief.adherence": "logging adherence",
    "reports.brief.medications": "Patient-reported medications",
    "reports.brief.discussion": "Suggested discussion points",
    "reports.brief.headline": "30-day mean pain {avg}/10 with {flares}; {velocity}.",
    "reports.brief.headline.noData": "No logged data in this period — brief cannot characterize current status.",
    "reports.brief.flareDays.zero": "no flare days",
    "reports.brief.flareDays.one": "1 flare day",
    "reports.brief.flareDays.two": "2 flare days",
    "reports.brief.flareDays.few": "{count} flare days",
    "reports.brief.flareDays.many": "{count} flare days",
    "reports.brief.ratePerMonth": "~{perMonth}/mo",
    "reports.brief.velocity.improving": "improving",
    "reports.brief.velocity.stable": "stable",
    "reports.brief.velocity.worsening": "worsening",
    "reports.brief.velocity.insufficientData": "insufficient data to characterize",
    "reports.brief.trend.rising": "rising",
    "reports.brief.trend.falling": "falling",
    "reports.brief.trend.stable": "stable",
    "reports.brief.trend.insufficientData": "insufficient-data",
    "reports.brief.streakDays": "{count}-day streak",
    "reports.brief.discussion.worsening": "Symptom trajectory is worsening — is the current management plan still appropriate?",
    "reports.brief.discussion.painControl": "Mean pain {avg}/10 remains clinically significant — options for better control?",
    "reports.brief.discussion.medicationsList": "Patient reports taking: {meds} — confirm regimen, adherence, and tolerability.",
    "reports.brief.discussion.noMedications": "No medications mentioned in logs — is the patient on any current pharmacotherapy?",
    "reports.brief.discussion.sleep": "Sleep disturbance is among the most-reported symptoms — evaluate sleep management.",
    "reports.brief.discussion.weather": "Weather correlation detected ({factors}) — consider discussing environmental trigger management.",
    "reports.brief.discussion.default": "Continue current plan; reinforce pacing, graded exercise, and sleep hygiene.",
    "reports.brief.caveat": "Generated from {logged}/{total} patient-logged days ({adherence}% adherence). self-reported data; not a clinical assessment or diagnosis.",
    "reports.filter.all": "All",
    "reports.download.title": "Clinical Summary PDF",
    "reports.download.description": "Includes the 30-day pain trend chart, correlation summary, key insights, and the full log annex.",
    "reports.download.generating": "Generating Report…",
    "reports.download.button": "Download PDF Report",
    "reports.exportError": "Failed to generate report",
    "reports.brief.detectedTriggers": "Detected triggers",
    "pdf.title": "Medical Health Summary",
    "pdf.subtitle": "Generated for review with your care team",
    "pdf.patient": "Patient",
    "pdf.reportDate": "Report date",
    "pdf.reportingPeriod": "Reporting period",
    "pdf.periodRange": "{start} to {end}",
    "pdf.executiveSummary": "1. Executive Summary",
    "pdf.avgPain": "Average pain (90 days)",
    "pdf.flareDays": "Flare-up days (pain ≥ 7)",
    "pdf.primarySymptoms": "Primary symptoms",
    "pdf.entries": "Entries in period",
    "pdf.briefTitle": "AI Clinical Executive Brief (30-day)",
    "pdf.chartTitle": "2. Pain Trend (last 30 days)",
    "pdf.notEnoughData": "Not enough data to plot.",
    "pdf.correlationTitle": "3. Correlation Summary",
    "pdf.correlationText": "The strongest relationship found in your logs: {message}",
    "pdf.noCorrelation": "No statistically meaningful symptom-pain relationships were detected with the current data. Continue logging symptoms for sharper correlations.",
    "pdf.insightsTitle": "4. Key Health Insights",
    "pdf.insightsEmpty": "Log your pain and symptoms for at least 5 days to unlock personalized insights.",
    "pdf.annexTitle": "Annex A: Full Log History",
    "pdf.annexSubtitle": "Raw entries for {count} logs within the reporting period.",
    "pdf.footer": "Generated by FibroCare · For informational purposes, not a medical diagnosis.",
    "pdf.colDate": "Date",
    "pdf.colPain": "Pain",
    "pdf.colMood": "Mood",
    "pdf.colSymptoms": "Symptoms / Notes",
    "pdf.avg7d": "7-day mean",
    "pdf.na": "n/a",
    "pdf.noMedsMentioned": "None mentioned in logs",
    "careInsight.ariaLabel": "AI care insight",
    "careInsight.title": "AI Care Insight",
    "careInsight.flareCalm": "calm flare",
    "careInsight.flareMild": "mild flare",
    "careInsight.flareSevere": "severe flare",
    "careInsight.easing": "easing",
    "careInsight.watch": "watch",
    "careInsight.title.severeHeat": "A flare day with heat. Let's protect your calm",
    "careInsight.title.severe": "A flare day. Keep your support close",
    "careInsight.title.mildHeat": "Mild discomfort with heat. Small steps help",
    "careInsight.title.mild": "Mild discomfort, and gentle care goes a long way",
    "careInsight.title.calmHeat": "Calm day, warm weather. Keep your rhythm",
    "careInsight.title.calm": "A steady, calm day. Nurture it",
    "careInsight.heat.severe": "Heat and inflammation can make flare pain harder to manage. Keep the room cool and give your body extra rest.",
    "careInsight.heat.mild": "The heat can amplify achiness at your level. Staying cool and hydrated now can keep discomfort from climbing.",
    "careInsight.heat.calm": "Today's warmth is mild enough to stay comfortable. Keep water close and avoid the midday sun.",
    "careInsight.humidity.humidSevere": "High humidity can press on sensitive joints. A dehumidifier or fan in your space can make the room feel gentler.",
    "careInsight.humidity.humid": "The air is humid today, which can add a heavy feeling. Light layers and airflow help.",
    "careInsight.humidity.dry": "Very dry air can irritate skin and sinuses. A little extra water and a humidifier keep things comfortable.",
    "careInsight.humidity.moderate": "Humidity is in a comfortable range today.",
    "careInsight.barometric.dropping": "The barometer is falling quickly, which can precede flare days for sensitive bodies.",
    "careInsight.barometric.low": "Low barometric pressure can heighten pain sensitivity today.",
    "careInsight.trend.rising": "Your pain has been gently trending up this week, so pacing matters more than usual today.",
    "careInsight.trend.falling": "Your pain has been easing over recent days. A good moment for light, careful movement.",
    "careInsight.trend.stable": "Your pain has been steady this week.",
    "careInsight.suggest.severe.1": "Rest in a cool, low-light room and limit activity to essential tasks.",
    "careInsight.suggest.severe.2": "Try a warm compress or a warm bath on tense areas to ease muscle tension, and hydrate steadily.",
    "careInsight.suggest.severe.3": "Switch on Calming Mode for 3 minutes of slow breathing.",
    "careInsight.suggest.mild.1": "Take a short gentle walk or do light stretching to keep circulation moving.",
    "careInsight.suggest.mild.2": "Keep water nearby and pace tasks with a small break between them.",
    "careInsight.suggest.mild.3": "Note how your body responds so tomorrow's check-in is easier.",
    "careInsight.suggest.calm.1": "Keep your usual gentle routine and stay hydrated.",
    "careInsight.suggest.calm.2": "Spend a few quiet minutes outdoors while the weather supports it.",
    "careInsight.suggest.calm.3": "Keep logging consistently. Patterns become clearer every day.",
    "insight.highPainAvg.title": "High pain levels",
    "insight.highPainAvg.message": "Your average pain over the last {days} days is {avg}/10, in the high range. Consider discussing your current plan with your care team.",
    "insight.lowPainAvg.title": "Pain Is Well Managed",
    "insight.lowPainAvg.message": "Your average pain is {avg}/10. Whatever you're doing is working. Keep it up.",
    "insight.frequentFlares.title": "Frequent Flare-ups",
    "insight.frequentFlares.message": "You logged {count} flare-level days (pain ≥ 7) in the last {days} days. Frequent flares may signal a need for a treatment review.",
    "insight.recurringFlares.title": "Recurring Flare Days",
    "insight.recurringFlares.message": "You've had {count} flare-level days recently. Patterns of flares often follow sleep, stress, or activity changes.",
    "insight.trendWorsening.title": "Pain Trending Upward",
    "insight.trendWorsening.message": "Your pain has risen by {delta} points between the first and second half of this period.",
    "insight.trendImproving.title": "Pain Trending Downward",
    "insight.trendImproving.message": "Your pain has eased by {delta} points across this period. Keep following what helps.",
    "insight.weekdayPattern.title": "Weekday Pattern",
    "insight.weekdayPattern.message": "{day} tends to be your hardest day (avg {avg}/10 across {count} logs). Planning lighter on that day may help.",
    "insight.symptomCorrelation.positive.title": "Symptom-Pain Link Detected",
    "insight.symptomCorrelation.positive.message": "Days with \"{symptom}\" average {delta} points higher pain ({count} occurrences). Worth tracking closely.",
    "insight.symptomCorrelation.negative.title": "Symptom Seen on Easier Days",
    "insight.symptomCorrelation.negative.message": "\"{symptom}\" appears mostly on lighter days ({delta} lower pain). It may be more of an outcome than a trigger.",
    "insight.lutealCognitive.title": "Hormonal Cognitive Influence",
    "insight.lutealCognitive.message": "Your current luteal phase correlates with higher cognitive symptoms (brain fog/focus). This is a common hormonal pattern.",
    "insight.heatTherapy.title": "Comfort Recommendation",
    "insight.heatTherapy.message": "High severity pain detected in pelvic or lower back areas. Warm therapy or a compression wrap may provide relief.",
    "chart.emptyTitle": "No pain entries in the last 7 days.",
    "chart.emptyHint": "Log your check-in above to start your weekly progress.",
    "chart.legendPain": "Pain level",
    "chart.legendAverage": "Weekly average",
    "chart.summary": "Highest {max} out of 10, lowest {min} out of 10.",
    "chart.aria": "Weekly pain progress. {text}",
    "chart.painLevel": "/10",
    "chart.avgLabel": "avg {avg}",
    "recovery.sensory.title": "Sensory Rest",
    "recovery.sensory.on": "Sensitive mode is on: screen dimmed and motion stilled.",
    "recovery.sensory.off": "Dim the screen and disable animations for a moment.",
    "recovery.sensory.activate": "Activate Sensitive Mode",
    "recovery.sensory.deactivate": "Deactivate Sensitive Mode",
    "recovery.breath.title": "Mindful Breath",
    "recovery.breath.description": "A 3-minute guided breathing session to lower stress.",
    "recovery.breath.openZen": "Open Zen Portal",
    "recovery.gratitude.title": "Gratitude Journal",
    "recovery.gratitude.description": "Tap a moment or write your own.",
    "recovery.gratitude.ariaLabel": "Quick gratitude prompts",
    "recovery.gratitude.textareaLabel": "Something I am grateful for",
    "recovery.gratitude.placeholder": "Something I'm grateful for...",
    "recovery.gratitude.saveEntry": "Save Entry",
    "recovery.gratitude.saved": "Saved ✓",
    "recovery.gratitude.chip1": "Peaceful moment",
    "recovery.gratitude.chip2": "Good sleep",
    "recovery.gratitude.chip3": "A warm tea",
    "spoonTracker.title": "Spoon Tracker",
    "spoonTracker.subtitle": "Daily energy budget",
    "spoonTracker.undoAria": "Undo last change",
    "spoonTracker.aria": "{current} of {max} spoons remaining",
    "spoonTracker.removeAria": "Remove one spoon",
    "spoonTracker.addAria": "Add one spoon",
    "spoonTracker.preset.shower": "Shower",
    "spoonTracker.preset.walk": "Short Walk",
    "spoonTracker.preset.cooking": "Cooking",
    "spoonTracker.preset.groceries": "Groceries",
    "spoonTracker.preset.rest": "Rest",
    "spoonTracker.preset.nap": "Nap",
    "bodyMap.title": "Pain Map",
    "bodyMap.front": "Front",
    "bodyMap.back": "Back",
    "bodyMap.mobility": "Mobility",
    "bodyMap.joints": "Joints",
    "bodyMap.muscles": "Muscles",
    "bodyMap.groups": "Groups",
    "bodyMap.subtitle": "Tap areas where you feel pain",
    "bodyMap.emptyHint": "Tap a body area to mark pain",
    "bodyMap.point.neck": "Neck",
    "bodyMap.point.shoulders": "Shoulders",
    "bodyMap.point.upperArms": "Upper arms",
    "bodyMap.point.lowerBack": "Lower Back",
    "bodyMap.point.knees": "Knees",
    "bodyMap.point.occiput": "Occiput",
    "bodyMap.point.lowCervical": "Low Cervical",
    "bodyMap.point.trapezius": "Trapezius",
    "bodyMap.point.supraspinatus": "Supraspinatus",
    "bodyMap.point.secondRib": "Second Rib",
    "bodyMap.point.epicondyle": "Elbow (Epicondyle)",
    "bodyMap.point.gluteal": "Gluteal",
    "bodyMap.point.trochanter": "Greater Trochanter",
    "bodyMap.viewGroupAria": "Body view",
    "medication.title": "Today's Medications",
    "medication.subtitle": "Track your doses",
    "medication.morningSupplement": "Morning Supplement",
    "medication.painRelief": "Pain Relief",
    "medication.eveningMag": "Evening Magnesium",
    "medication.taken": "Taken",
    "medication.pending": "Pending",
    "medication.nextDose": "Next dose in",
    "zen.focusBreath": "Focus on your breath",
    "zen.ultraDark": "Ultra Dark",
    "zen.exitUltraDark": "Exit Ultra Dark",
    "zen.switchCalming": "Switch to Calming Mode",
    "zen.breatheIn": "Breathe In ({seconds}s)",
    "zen.breatheOut": "Breathe Out ({seconds}s)",
    "zen.soundscapeAria": "Soundscape mixer",
    "zen.sound.rain.label": "Rain",
    "zen.sound.rain.description": "Soft falling rain",
    "zen.sound.forest.label": "Forest",
    "zen.sound.forest.description": "Deep woodland ambience",
    "zen.sound.whiteNoise.label": "White Noise",
    "zen.sound.whiteNoise.description": "Steady static",
    "zen.sound.deepHum.label": "Deep Hum",
    "zen.sound.deepHum.description": "Low grounding tone",
    "zen.pause": "Pause",
    "zen.resume": "Resume",
    "zen.pausedAria": "Breathing paused",
    "zen.volumeAria": "Ambient sound volume",
    "zen.shortcutHint": "Space to pause/resume \u00b7 Esc to exit",
    "narration.title": "Your patterns, in plain words",
    "narration.explain": "Explain this to me",
    "narration.stop": "Stop",
    "narration.dismiss": "Dismiss",
    "narration.generatingAria": "Generating explanation",
    "narration.offline": "The personalized explanation needs a live AI key. The data-driven insights above already say a lot. Add GEMINI_API_KEY to the server to turn it on.",
    "narration.detailedAnalysisTitle": "Detailed pattern analysis",
    "narration.detailedAnalysisDesc": "A closer look at your health logs",
    "narration.patternBody": "Your patterns show a strong correlation between sleep quality and pain levels the following morning.",
    "narration.aiObservationLabel": "AI Observation",
    "narration.aiObservationText": "Flare-ups typically occur 24-48 hours after high-stress events.",
    "narration.missingLogsFallback": "Log at least 5 days of pain and symptoms to get a personalized narration of your patterns.",
    "reflection.button": "Reflect with AI",
    "reflection.stop": "Stop reflection",
    "reflection.generatingAria": "Reflecting on your note",
    "reflection.resultLabel": "A gentle reflection",
    "reflection.dismissAria": "Dismiss reflection",
    "reflection.offline": "AI reflection needs a live key. Your note is saved and stays private on this device.",
    "companion.openAria": "Open AI Care Companion",
    "companion.dialogAria": "AI Care Companion chat",
    "companion.title": "AI Care Companion",
    "companion.waking": "Waking up…",
    "companion.offlineBadge": "Offline · add an AI key to chat live",
    "companion.liveSimulated": "Live · simulated ({provider})",
    "companion.liveRag": "Live · RAG Active",
    "companion.retrieving": "Searching medical references and gathering your data...",
    "companion.closeAria": "Close chat",
    "companion.hello": "I'm here with you. Ask me anything about managing fibromyalgia day to day. I already know your recent logs.",
    "companion.suggestion1": "What helps most during a flare-up?",
    "companion.suggestion2": "Any patterns in my logs this week?",
    "companion.suggestion3": "Help me plan a gentle, low-energy day",
    "companion.offlinePaused": "Chat is paused while the AI is offline.",
    "companion.chatFormAria": "Chat with AI companion",
    "companion.inputLabel": "Message the AI care companion",
    "companion.inputPlaceholder": "How are you feeling right now?",
    "companion.checkedData": "Checked your latest data",
    "companion.errorRetry": "Try again",
    "companion.errorDefault": "Something went wrong. Please try again.",
    "companion.authRequired": "Your session expired. Please sign in again.",
    "companion.authExpiredBanner": "Your chat session expired. Sign in again to continue your conversation.",
    "companion.authSignIn": "Sign in again",
    "companion.responding": "The companion is responding.",
    "companion.sendAria": "Send message",
    "companion.stopAria": "Stop generating",
    "companion.offlineHint": "The companion is resting. Set GEMINI_API_KEY (or another provider key) in your server environment to wake it up.",
    "companion.mockHint": "Mock mode is on, so replies are simulated locally. Add a real GEMINI_API_KEY and restart the dev server for live AI.",
    "logs.pageTitle": "Health Logs",
    "logs.pageSubtitle": "Review, filter and manage your check-in history.",
    "logs.summaryAria": "Log summary",
    "logs.stat.totalEntries": "Total entries",
    "logs.stat.avgPain": "Average pain",
    "logs.stat.flareDays": "Flare days",
    "logs.stat.totalHint": "logged check-ins",
    "logs.stat.avgHint": "across all entries",
    "logs.stat.flareHint": "pain level 7+",
    "logs.empty.title": "No logs found",
    "logs.empty.description": "Start tracking your pain levels on the dashboard and your history will appear here.",
    "logs.empty.cta": "Go to Dashboard",
    "logs.tableTitle": "Pain Log History",
    "logs.showing": "Showing {shown} of {total} entries.",
    "logs.searchPlaceholder": "Search mood or notes",
    "logs.searchAria": "Search logs by mood or notes",
    "logs.clearAria": "Clear search",
    "logs.filterLabel": "Filter by pain severity",
    "logs.col.date": "Date",
    "logs.col.pain": "Pain Level",
    "logs.col.mood": "Mood",
    "logs.col.notes": "Notes",
    "logs.col.action": "Action",
    "logs.noMatch.title": "No matching logs",
    "logs.noMatch.description": "Try a different severity or clear your search.",
    "logs.clearFilters": "Clear filters",
    "logs.noNotes": "No notes",
    "logs.confirm": "Confirm?",
    "logs.confirmDeleteAria": "Confirm delete log from {date}",
    "logs.deleteAria": "Delete log from {date}",
    "logs.severity.all": "All",
    "logs.severity.low": "Low",
    "logs.severity.moderate": "Moderate",
    "logs.severity.severe": "Severe",
    "logs.painAria": "Pain level {level}",
    "profile.pageTitle": "User Profile",
    "profile.pageSubtitle": "Manage your account details and track your progress.",
    "profile.loading": "Loading profile...",
    "profile.streakLabel": "Streak",
    "profile.days": "{count} Days",
    "profile.totalLogsLabel": "Total Logs",
    "profile.accountTitle": "Account Settings",
    "profile.accountDescription": "Customize how your name appears in the app.",
    "profile.displayNameLabel": "Display Name",
    "profile.displayNamePlaceholder": "Your Name",
    "profile.saving": "Saving...",
    "profile.saveChanges": "Save Changes",
    "profile.nameUpdated": "Name updated successfully!",
    "profile.updateFailed": "Failed to update profile",
    "profile.updateError": "Something went wrong while saving your profile.",
    "profile.motionTitle": "Motion & Comfort",
    "profile.motionDescription": "Reduce or disable on-screen motion if it feels overwhelming.",
    "profile.gentleMotion": "Gentle Motion",
    "profile.motionOn": "Cards gently float, tilt, and animate as you interact.",
    "profile.motionOff": "Motion is turned off for a calmer, steadier experience.",
    "profile.biometricTitle": "Biometric Unlock",
    "profile.biometricEnable": "Enable Biometric Unlock",
    "profile.biometricEnabled": "Biometric unlock enabled.",
    "profile.biometricDisable": "Disable Biometric Unlock",
    "profile.biometricUnsupported": "Biometric unlock is not supported on this device or browser.",
    "video.tab": "Guided video",
    "video.loading": "Loading guide…",
    "video.badge": "Guide",
    "video.openExternal": "Open the guided video in a new tab",
    "video.unavailable": "The video guide is unavailable right now, so here are the steps instead.",
    "dashboard.section.today": "Today",
    "dashboard.section.core": "Core tools",
    "dashboard.section.pro": "Doctors & Consultations",
    "dashboard.pro.title": "Centers for Doctors and Medical Consultations",
    "dashboard.pro.subtitle": "Trusted medical content from verified doctors and direct consultations.",
    "dashboard.pro.doctorFeed": "Latest from Doctors",
    "dashboard.pro.symptomHelper": "AI Symptom Helper",
    "dashboard.pro.viewAll": "View All",
    "dashboard.pro.browseDoctors": "Browse Doctor Articles",
    "dashboard.pro.startConsultation": "Start Consultation or Chat with Doctor",
    "dashboard.pro.badgeText": "Pro",
    "dashboard.section.insights": "Insights & gentle support",
    "dashboard.section.health": "Health tracking & insights",
    "dashboard.toolkitCard.title": "Somatic Toolkit & Exercises",
    "dashboard.toolkitCard.desc": "Gentle exercises matched to today's energy, calming offline audio, breathing guides, sleep & HRV, and medication safety.",
    "dashboard.toolkitCard.cta": "Open the Somatic Toolkit",
    "toolkit.title": "Care Toolkit",
    "toolkit.subtitle": "Movement, sleep, medication safety, and community insights. All of it works offline.",
    "medications.title": "Medications & Safety",
    "medications.subtitle": "Track your regimen and screen it for common fibromyalgia interactions.",
    "medications.namePlaceholder": "Medication or supplement",
    "medications.dosePlaceholder": "Dose",
    "medications.timingLabel": "Timing",
    "medications.timing.morning": "Morning",
    "medications.timing.evening": "Evening",
    "medications.timing.bedtime": "Bedtime",
    "medications.add": "Add",
    "medications.remove": "Remove",
    "medications.empty": "No medications added yet. Start by adding one below.",
    "medications.alerts": "Interaction alerts",
    "medications.severity.critical": "Critical",
    "medications.severity.warning": "Warning",
    "medications.severity.caution": "Caution",
    "medications.defaultDose": "as prescribed",
    "medications.disclaimer": "This is a screening aid only. Always confirm interactions with your pharmacist or care team.",
    "somatic.title": "Movement & Flare Toolkit",
    "somatic.subtitle": "Somatic exercises, calming audio, and breathing, matched to your energy budget today.",
    "somatic.painToday": "Pain today",
    "somatic.spoonsLeft": "Spoons left",
    "somatic.start": "Start",
    "somatic.stop": "Stop",
    "somatic.noneSuitable": "Rest is the exercise today. Nothing suits this pain level.",
    "somatic.ex.breathing.title": "Diaphragmatic breathing",
    "somatic.ex.breathing.desc": "Slow belly breathing to calm the nervous system.",
    "somatic.ex.humming.title": "Vagus nerve humming",
    "somatic.ex.humming.desc": "Gentle humming to stimulate the vagus nerve.",
    "somatic.ex.eyes.title": "Slow eye-movement calm",
    "somatic.ex.eyes.desc": "Slow side-to-side gaze to down-shift arousal.",
    "somatic.ex.neck.title": "Neck micro-releases",
    "somatic.ex.neck.desc": "Tiny, pain-free neck movements at your own pace.",
    "somatic.ex.shoulders.title": "Shoulder circles",
    "somatic.ex.shoulders.desc": "Small, slow circles to release the shoulder girdle.",
    "somatic.ex.catcow.title": "Cat-cow",
    "somatic.ex.catcow.desc": "Spine flexion cycles, only within comfort.",
    "somatic.ex.legs.title": "Legs up the wall",
    "somatic.ex.legs.desc": "Restorative inversion; drain and settle.",
    "somatic.ex.bodyscan.title": "Guided body scan",
    "somatic.ex.bodyscan.desc": "Progressive attention from head to toes.",
    "somatic.audio.title": "Flare emergency audio",
    "somatic.audio.binaural432": "Binaural 432 Hz",
    "somatic.audio.binaural528": "Binaural 528 Hz",
    "somatic.audio.brown": "Deep brown noise",
    "somatic.audio.headphonesNote": "Use headphones for binaural beats. Works fully offline.",
    "somatic.breathing.title": "4-7-8 breathing",
    "somatic.breathing.inhale": "Inhale",
    "somatic.breathing.hold": "Hold",
    "somatic.breathing.exhale": "Exhale",
    "somatic.breathing.idle": "Ready when you are",
    "somatic.breathing.idleHint": "tap start to begin",
    "somatic.breathing.cycle": "cycle",
    "postMeal.title": "Post-Meal Fatigue",
    "postMeal.subtitle": "Track how meals affect your energy",
    "postMeal.mealLabel": "Meal Type",
    "postMeal.fatigueLabel": "Fatigue Level",
    "postMeal.log": "Log Meal Fatigue",
    "postMeal.saved": "Logged!",
    "postMeal.recent": "Recent Logs",
    "postMeal.undoAria": "Undo last entry",
    "postMeal.meal.breakfast": "Breakfast",
    "postMeal.meal.lunch": "Lunch",
    "postMeal.meal.dinner": "Dinner",
    "postMeal.meal.snack": "Snack",
    "postMeal.fatigue.none": "None",
    "postMeal.fatigue.mild": "Mild",
    "postMeal.fatigue.moderate": "Moderate",
    "postMeal.fatigue.high": "High",
    "postMeal.fatigue.severe": "Severe",
    "rescue.title": "AI Rescue Recommendation",
    "rescue.subtitle": "A quiet, single-action tip shaped by today's pain, energy, and weather.",
    "rescue.generate": "Generate Recommendation",
    "rescue.regenerate": "Try another tip",
    "rescue.context.pain": "Pain",
    "rescue.context.spoons": "Spoons left",
    "rescue.context.weather": "Weather",
    "rescue.context.estimate": "offline estimate",
    "rescue.spoonsLabel": "Remaining spoons",
    "rescue.tip.flare.1": "This moment is a wave, not a verdict — the flare owns the next hour, not the day.",
    "rescue.tip.flare.2": "Your body is asking for a lower gear right now. Answer with one small kindness.",
    "rescue.tip.weather.1": "Pressure and humidity are tugging at you today — keep the load light and steady.",
    "rescue.tip.weather.2": "The weather is working against you today; your only job is to protect your energy.",
    "rescue.tip.moderate.1": "Energy is holding but not overflowing — protect your best hour for what matters.",
    "rescue.tip.moderate.2": "You have room to move today, but only at a pace your body already knows.",
    "rescue.tip.lowSpoons.1": "Spoons are nearly gone — the kindest action now is stillness, not accomplishment.",
    "rescue.tip.lowSpoons.2": "With little energy left, choose one tiny comfort over any task.",
    "rescue.tip.calm.1": "Conditions are quiet — spend one focused block, then rest before you need it.",
    "rescue.tip.calm.2": "Today's weather is on your side. Keep effort gentle and consistent.",
    "rescue.action.flare.1": "Lie down with a warm compress for 10 minutes",
    "rescue.action.flare.2": "Sip water slowly and breathe 4-7-8 once",
    "rescue.action.weather.1": "Take a 15-minute slow walk outdoors",
    "rescue.action.weather.2": "Do one 10-minute gentle stretch session",
    "rescue.action.moderate.1": "Complete one focus task, then stop",
    "rescue.action.moderate.2": "Do a 20-minute paced walk",
    "rescue.action.lowSpoons.1": "Rest in a dark, quiet room for 10 minutes",
    "rescue.action.lowSpoons.2": "Sit and take three slow breaths, nothing else",
    "rescue.action.calm.1": "Tackle one focus task in a single block",
    "rescue.action.calm.2": "Do a 20-minute paced walk",
    "rescue.why.flare.1": "Flare-level pain responds best to low stimulation and gentle warmth.",
    "rescue.why.flare.2": "Slow breathing lowers the stress response that amplifies pain.",
    "rescue.why.weather.1": "Gentle movement at your best hour keeps pacing without adding flare risk.",
    "rescue.why.weather.2": "Stretching eases the stiffness that follows pressure and humidity shifts.",
    "rescue.why.moderate.1": "A single focused block spends energy while it is plentiful.",
    "rescue.why.moderate.2": "Pacing keeps you consistent without borrowing from tomorrow.",
    "rescue.why.lowSpoons.1": "Rest is the fastest way to rebuild a spoon at this hour.",
    "rescue.why.lowSpoons.2": "Breathing resets the nervous system without spending energy.",
    "rescue.why.calm.1": "One focused block uses today's energy window before weather shifts.",
    "rescue.why.calm.2": "Consistent gentle effort protects you across the full day.",
    "sleep.title": "Sleep Architecture & HRV",
    "sleep.subtitle": "Screen for non-restorative sleep patterns and plan around fibro fog.",
    "sleep.hours": "Hours slept",
    "sleep.awakenings": "Awakenings",
    "sleep.restLabel": "How rested do you feel?",
    "sleep.rest.1": "Exhausted",
    "sleep.rest.2": "Poorly rested",
    "sleep.rest.3": "Okay",
    "sleep.rest.4": "Well rested",
    "sleep.rest.5": "Fully refreshed",
    "sleep.syncWearable": "Sync wearable",
    "sleep.deep": "Deep sleep",
    "sleep.hrv": "HRV",
    "sleep.restingHr": "Resting HR",
    "sleep.alphaDelta": "Alpha-delta intrusion screen",
    "sleep.alphaDelta.likely": "Pattern likely: sleep looks non-restorative",
    "sleep.alphaDelta.possible": "Possible pattern. Keep tracking",
    "sleep.alphaDelta.unlikely": "Pattern unlikely",
    "sleep.alphaDelta.insufficient-data": "Not enough data yet",
    "sleep.deepStatus": "Deep sleep",
    "sleep.deep.low": "Low",
    "sleep.deep.normal": "Normal",
    "sleep.deep.high": "High",
    "sleep.deep.unknown": "Unknown",
    "sleep.fogRisk": "Fibro fog risk today",
    "sleep.fogLevel.low": "Low",
    "sleep.fogLevel.moderate": "Moderate",
    "sleep.fogLevel.high": "High",
    "sleep.fogGuidance.low": "Fog risk looks low — a good day for tasks that need focus; still pace yourself and protect tonight's sleep.",
    "sleep.fogGuidance.moderate": "Some fog risk — front-load anything requiring focus to your best hours, keep lists short, and take a real break midday.",
    "sleep.fogGuidance.high": "High fog risk today — treat thinking like a spoon: single-task, use notes and reminders, postpone decisions that can wait, and protect a 20-minute rest before you crash.",
    "sleep.disclaimer": "Self-tracking screening only, not a sleep study. Discuss persistent problems with your care team.",
    "communityInsights.title": "Community Insights",
    "communityInsights.subtitle": "Anonymized, region-level trends from the FibroCare community.",
    "communityInsights.region": "Region",
    "communityInsights.trendLead": "{pct}% of users in {region} report increased flare sensitivity right now",
    "communityInsights.dominantTrigger": "Dominant trigger",
    "communityInsights.barometric.falling": "pressure falling",
    "communityInsights.barometric.steady": "pressure steady",
    "communityInsights.barometric.rising": "pressure rising",
    "communityInsights.reportingUsers": "{count} reporting users",
    "communityInsights.leaderboard": "Top coping strategies (community-voted)",
    "communityInsights.votes": "{count} votes",
    "communityInsights.disclaimer": "Modeled anonymized aggregates. No individual data is ever shown.",
    "triggers.barometricDrop": "barometric pressure drop",
    "triggers.humidity": "humidity",
    "triggers.poorSleep": "poor sleep",
    "triggers.overexertion": "overexertion",
    "triggers.stress": "stress",
    "coping.pacedBreathing": "Paced breathing",
    "coping.warmWaterTherapy": "Warm water therapy",
    "coping.gradedWalking": "Graded walking",
    "coping.sleepHygiene": "Sleep hygiene routine",
    "coping.mindfulness": "Mindfulness practice",
    "coping.heatTherapy": "Heat therapy",
    "coping.taiChi": "Tai chi",
    "profile.motionToggleAria": "Toggle gentle motion",
    "profile.privacyTitle": "Privacy Lock",
    "profile.privacyDescOn": "A 4-digit PIN protects your logs. The app locks automatically when you leave the tab.",
    "profile.privacyDescOff": "Protect your sensitive health data with a 4-digit PIN.",
    "profile.newPinLabel": "New 4-digit PIN",
    "profile.enableLock": "Enable Lock",
    "profile.changePinLabel": "Change PIN",
    "profile.changePinPlaceholder": "New 4-digit PIN",
    "profile.update": "Update",
    "profile.disableLock": "Disable Lock",
    "profile.lockNow": "Lock Now",
    "profile.signinTitle": "Account Sign-in",
    "profile.signinDescription": "Sign in with a social provider to access FibroCare across devices.",
    "profile.signedInAs": "Signed in as {name}",
    "profile.signOut": "Sign out",
    "profile.signInGoogle": "Sign in with Google",
    "profile.signInGithub": "Sign in with GitHub",
    "landing.openMenu": "Open menu",
    "landing.closeMenu": "Close menu",
    "landing.signIn": "Sign in",
    "landing.start": "Start your check-in",
    "landing.benefits.pill.core": "The core",
    "landing.benefits.pill.new": "New",
    "landing.resources.eyebrow": "From the library",
    "landing.resources.heading": "Guides for the days in between.",
    "landing.resources.viewAll": "View all resources",
    "landing.resources.card.category.basics": "Basics",
    "landing.resources.card.category.diagnosis": "Diagnosis",
    "landing.resources.card.category.treatment": "Treatment",
    "landing.resources.card.category.movement": "Movement",
    "landing.resources.card.category.nutrition": "Nutrition",
    "landing.resources.card.category.faq": "FAQ",
    "landing.resources.card.readGuide": "Read the guide",
    "landing.nav.how": "How it works",
    "landing.nav.features": "What you get",
    "landing.nav.stories": "Stories",
    "landing.nav.faq": "FAQ",
    "landing.hero.badge": "Made for life with fibromyalgia",
    "landing.hero.heading": "Your pain is real. Your pace is yours.",
    "landing.hero.subheading": "Daily check-ins that turn invisible symptoms into clear patterns, calmer days, and reports your care team can actually use.",
    "landing.hero.seeHow": "See how it works",
    "landing.hero.checkinTitle": "Today's check-in",
    "landing.hero.done": "Done",
    "landing.hero.pain": "Pain",
    "landing.hero.energy": "Energy",
    "landing.hero.sleep": "Sleep",
    "landing.hero.gentle": "Gentle",
    "landing.hero.low": "Low",
    "landing.hero.sleepValue": "6h",
    "landing.hero.daily": "daily check-in",
    "landing.hero.pdf": "PDF report",
    "landing.hero.doctorReady": "Doctor-ready",
    "landing.hero.minutes": "2 min",
    "landing.hero.mockupSub": "Two minutes, gently recorded.",
    "landing.hero.freeStart": "Free to start",
    "landing.hero.noCard": "No credit card",
    "landing.hero.private": "Private by design",
    "landing.trust.encrypted": "Encrypted & never sold",
    "landing.trust.label": "Trust & privacy commitments",
    "landing.tagline.eyebrow": "The quiet part",
    "landing.tagline.heading": "Your body keeps its own score. FibroCare helps you read it.",
    "landing.tagline.copy": "People living with fibromyalgia are not believed enough: by doctors, by workplaces, sometimes by themselves. FibroCare starts from the opposite place: your experience is the data.",
    "landing.day.title": "A day with fibromyalgia",
    "landing.day.rail": "A day with fibromyalgia",
    "landing.day.scenes": "{count} scenes",
    "landing.day.morning": "Morning",
    "landing.day.midday": "Midday",
    "landing.day.evening": "Evening",
    "landing.day.night": "Night",
    "landing.day.morningHeadline": "You wake up already spent.",
    "landing.day.morningCopy": "The alarm goes off, but your body didn't get the message. The heaviness is there before your feet touch the floor, and it isn't laziness.",
    "landing.day.middayHeadline": "The fog settles in.",
    "landing.day.middayCopy": "Words scatter. The simplest task costs double. You learn to pace the middle of the day, saving the lightest work for the foggiest hours.",
    "landing.day.eveningHeadline": "A flare arrives uninvited.",
    "landing.day.eveningCopy": "Pain moves without an agenda: shoulders, hips, hands. You breathe through it, slowly, because you know this too will pass.",
    "landing.day.nightHeadline": "You made it through.",
    "landing.day.nightCopy": "One more day logged, one more thread of a pattern. Tonight you don't fight the sleep you can't command. You rest.",
    "landing.benefits.heading": "Built for the reality of living with it.",
    "landing.benefits.copy": "Not another tracker for people who feel fine. FibroCare is shaped around the days when fine is not on the menu.",
    "landing.benefits.checkinsTitle": "Two-minute check-ins",
    "landing.benefits.checkinsCopy": "Pain, energy, sleep, mood: logged on gentle sliders in under two minutes, so checking in never becomes one more demand on a hard day.",
    "landing.benefits.patternsTitle": "Patterns you can finally see",
    "landing.benefits.patternsCopy": "Insights connect your flares to sleep, weather, and pace, turning \"why me?\" into \"what I can control.\"",
    "landing.benefits.reportTitle": "A report your doctor can read",
    "landing.benefits.reportCopy": "A clean, one-tap PDF summary of your trends, so your appointment starts from your evidence, not your memory.",
    "landing.benefits.toolsTitle": "Tools for tender days",
    "landing.benefits.toolsCopy": "Breathing exercises, soundscapes, and a gratitude journal live one tap away in the Zen portal: calm when you need it most.",
    "landing.benefits.privacyTitle": "Private by design",
    "landing.benefits.privacyCopy": "Optional PIN lock and a Sensory Mode that calms colors and motion. Your data is encrypted and never sold.",
    "landing.benefits.readyTitle": "Ready when you are.",
    "landing.benefits.readyCopy": "No pressure to be consistent before it works. FibroCare meets you wherever today lands.",
    "landing.how.heading": "Three small things, done gently.",
    "landing.how.step1Title": "Check in daily",
    "landing.how.step1Copy": "Two minutes on gentle sliders: pain, energy, sleep, mood. No forms, no pressure, no judgment.",
    "landing.how.step2Title": "See the pattern",
    "landing.how.step2Copy": "FibroCare connects the dots across your logs, so flares stop feeling random and start looking like something you can plan around.",
    "landing.how.step3Title": "Share what matters",
    "landing.how.step3Copy": "Bring a clear, one-tap PDF summary to your next appointment: your evidence, in a form your care team can use.",
    "landing.testimonials.heading": "In their words.",
    "landing.testimonials.copy": "Real check-ins, real patterns, real conversations with care teams.",
    "landing.testimonials.q1": "For the first time, my doctor saw my pain as a pattern instead of a mystery. I walked into that appointment with months of evidence.",
    "landing.testimonials.q2": "The two-minute check-ins are the only health app I have kept up with. It never makes me feel guilty on the bad days.",
    "landing.testimonials.q3": "Bringing the PDF report to my rheumatologist changed the whole conversation. We finally talked about trends, not anecdotes.",
    "landing.testimonials.amiraName": "Amira H.",
    "landing.testimonials.amiraRole": "Living with fibromyalgia since 2019",
    "landing.testimonials.nourName": "Nour S.",
    "landing.testimonials.nourRole": "Primary school teacher",
    "landing.testimonials.monaName": "Mona K.",
    "landing.testimonials.monaRole": "Designer, diagnosed 2021",
    "landing.faq.heading": "Questions, answered gently.",
    "landing.faq.copy": "If you still have questions, the Resources library has deeper guides on symptoms, treatment, and everyday life with fibromyalgia.",
    "landing.faq.resources": "Explore resources",
    "landing.faq.q1": "Is FibroCare a diagnosis or a doctor?",
    "landing.faq.a1": "No. FibroCare is a companion for tracking and understanding your day-to-day experience. It never diagnoses, treats, or replaces medical care. It helps you show up to your care team with clearer information.",
    "landing.faq.q2": "How long does a check-in take?",
    "landing.faq.a2": "About two minutes. You move gentle sliders for pain, energy, sleep, and mood. There are no text fields to fill unless you want to add a note.",
    "landing.faq.q3": "Will my health data stay private?",
    "landing.faq.a3": "Yes. Your data is encrypted, stored securely, and never sold. You can also set an optional PIN lock and switch on Sensory Mode to reduce on-screen motion and color intensity.",
    "landing.faq.q4": "Can I really bring a report to my doctor?",
    "landing.faq.a4": "Yes. From the Reports area you can generate a clean, one-page PDF summary of your trends: pain patterns, flare frequency, sleep and energy averages, ready to share at your next appointment.",
    "landing.faq.q5": "What if I miss a day?",
    "landing.faq.a5": "Nothing breaks. If you miss days, your patterns just grow a little slower; it doesn't mean you've failed. Log when you can.",
    "landing.faq.q6": "Is it free to start?",
    "landing.faq.a6": "Yes. Signing up and starting your check-ins is free, with no credit card required. You can explore the full daily flow before deciding anything else.",
    "landing.final.heading": "Start where you are. Not where the checklist says.",
    "landing.final.copy": "Two minutes today. A clearer pattern this week. A better conversation with your care team when it matters.",
    "landing.final.free": "Free to start · No credit card · Your data stays yours",
    "landing.marquee.words": "rest pace breathe soften listen notice pause gently",
    "landing.footer.tagline": "A gentle, private companion for living with fibromyalgia. Not a medical device and never a replacement for your care team.",
    "landing.footer.resources": "Resources",
    "landing.footer.product": "Product",
    "landing.footer.about": "About fibromyalgia",
    "landing.footer.diagnosis": "Getting diagnosed",
    "landing.footer.treatment": "Treatment options",
    "landing.footer.exercises": "Gentle movement",
    "landing.footer.nutrition": "Nutrition",
    "landing.footer.faq": "FAQ",
    "landing.footer.privacy": "Privacy policy",
    "landing.footer.terms": "Terms of service",
    "landing.footer.madeWith": "Crafted with care.",
    "landing.footer.disclaimer": "Not a diagnostic tool. If you are in crisis, reach your local emergency services.",
    "landing.footer.copyright": "© {year} FibroCare.",
    "notification.title": "Notifications",
    "notification.empty": "You're all caught up. Gentle alerts will appear here.",
    "notification.markAllRead": "Mark all as read",
    "notification.bellAria": "Open notifications",
    "notification.closeAria": "Close notifications",
    "notification.dismissAria": "Dismiss notification",
    "notification.unreadCount": "{count} unread notifications",
    "notification.time.justNow": "Just now",
    "notification.time.minutesAgo": "{count}m ago",
    "notification.time.hoursAgo": "{count}h ago",
    "notification.time.daysAgo": "{count}d ago",
    "notification.type.weather_trigger": "Weather Alert",
    "notification.type.medication_reminder": "Medication Reminder",
    "notification.type.daily_checkin": "Daily Check-in",
    "notification.type.zen_recommendation": "Zen Recommendation",
    "notification.type.ai_prediction": "AI Prediction",
    "notification.weather.pressureDrop.title": "Pressure drop expected",
    "notification.weather.pressureDrop.message": "Barometric pressure is falling ({delta} hPa). You may feel more joint and muscle sensitivity today — pace yourself.",
    "notification.weather.lowPressure.title": "Low pressure today",
    "notification.weather.lowPressure.message": "Pressure is at {pressure} hPa, which can amplify aches. Warmth and hydration may help.",
    "notification.weather.humidity.title": "Humidity is high",
    "notification.weather.humidity.message": "Humidity is at {humidity}%, a known fibromyalgia trigger. Keep indoor air comfortable.",
    "notification.weather.heat.title": "Heat warning",
    "notification.weather.heat.message": "It's {temperature}°C — heat can intensify symptoms. Stay cool and hydrated.",
    "notification.weather.cold.title": "Cold weather alert",
    "notification.weather.cold.message": "It's {temperature}°C — cold can increase stiffness. Dress warmly and move gently.",
    "notification.ai.spike.title": "Pain spike detected",
    "notification.ai.spike.message": "Your last {count} logs reached {threshold}/10 or higher (peak {highest}/10). Rest and review what may have triggered it.",
    "notification.medication.due.title": "Medication due",
    "notification.medication.due.message": "It's time for {name}. Take it when you're ready.",
    "notification.zen.reminder.title": "Time for a zen break",
    "notification.zen.reminder.message": "A few minutes of paced breathing can calm your nervous system. Try a session in the Zen portal.",
    "notification.dailyLog.reminder.title": "Daily check-in reminder",
    "notification.dailyLog.reminder.message": "You haven't logged today. A 30-second check-in keeps your pain trends accurate.",
    "meta.title": "FibroCare - Empathetic Health Companion",
    "meta.description":
      "A gentle, state-aware space for managing fibromyalgia symptoms, flare-ups, and wellness.",
    "meta.ogTitle": "FibroCare - Your pain is real. Your pace is yours.",
    "meta.ogDescription":
      "Daily check-ins that turn invisible symptoms into clear patterns, calmer days, and reports your care team can actually use.",
    "meta.ogImageAlt": "FibroCare - Your pain is real. Your pace is yours.",
    "meta.ogFeaturesImageAlt":
      "FibroCare - Screenshots of the SOS crisis button, Fog Shield, and the Clinical Hub, in Arabic and English.",
    "doctor.title": "Doctor Hub",
    "doctor.subtitle": "Publish verified health insights for patients",
    "doctor.newPost": "New Article",
    "doctor.editPost": "Edit Article",
    "doctor.postTitle": "Article Title",
    "doctor.postContent": "Article Content",
    "doctor.postTags": "Tags (comma-separated)",
    "doctor.publish": "Publish",
    "doctor.draft": "Save Draft",
    "doctor.aiAssist": "AI Publishing Assistant",
    "doctor.aiAssistDescription": "Describe your clinical idea or paste raw notes — the AI will format them into a structured, evidence-backed patient guidance article.",
    "doctor.aiGenerating": "Generating article draft…",
    "doctor.aiDisclaimer": "AI provides informational summaries only and does not replace direct clinical judgment.",
    "doctor.verified": "Verified",
    "doctor.pending": "Pending Review",
    "doctor.rejected": "Rejected",
    "doctor.noPosts": "No articles published yet. Start writing to share your expertise with patients.",
    "doctor.feedTitle": "Doctor Insights",
    "doctor.feedSubtitle": "Verified health guidance from licensed professionals",
    "doctor.readMore": "Read Full Article",
    "doctor.backToDashboard": "Back to Dashboard",
    "doctor.dashboardTitle": "Doctor Publishing Dashboard",
    "doctor.dashboardSubtitle": "Create and manage patient-facing health content",
    "doctor.totalPosts": "Total Articles",
    "doctor.publishedCount": "Published",
    "doctor.pendingCount": "Pending Review",
    "doctor.aiLibrary.title": "AI-Generated Article Library",
    "doctor.aiLibrary.subtitle": "Articles grounded in Mayo Clinic and ACR guidance, signed by a curated set of consultant physicians.",
    "doctor.aiLibrary.reviewed": "Medically reviewed",
    "doctor.aiLibrary.loading": "Loading topics…",
    "doctor.aiLibrary.empty": "Preparing the library…",
    "doctor.aiLibrary.newBadge": "New",
    "doctor.aiLibrary.read": "Read article",
    "doctor.aiLibrary.disclaimer": "Note: Articles are for education only and do not replace medical care. Discuss any change with your care team.",
    "doctor.aiLibrary.signature": "Each article is signed by a consultant from a curated signature set",
    "doctor.aiLibrary.refresh": "Refresh library",
    "doctor.aiLibrary.refreshing": "Refreshing…",
    "doctor.aiLibrary.refreshed": "Library refreshed.",
    "doctor.aiLibrary.refreshError": "Could not refresh the library. Please try again.",
    "doctor.aiLibrary.minutesShort": "min",
    "doctor.aiLibrary.topicsAria": "Article topics",
    "doctor.aiLibrary.aiGenerated": "AI-generated",
    "doctor.reactions.like": "Like",
    "doctor.reactions.helpful": "Helpful",
    "doctor.reactions.signInHint": "Sign in to react.",
    "doctor.authorFallback": "Doctor",
    "doctor.postError": "Failed to publish.",
    "doctor.manualPublishing.title": "Manual publishing",
    "doctor.manualPublishing.subtitle": "Write your own article, set tags, and submit it for review. Your published pieces appear alongside AI-generated guidance.",
    "doctor.manualPublishing.openEditor": "Write a new article",
    "doctor.manualPublishing.closeEditor": "Close editor",
    "doctor.ownPosts.title": "Your articles",
    "doctor.ownPosts.subtitle": "Every post you have authored, including drafts awaiting review.",
    "doctor.postTitlePlaceholder": "e.g., Sleep Hygiene Tips for Fibromyalgia",
    "doctor.postContentPlaceholder": "Write your article content here…",
    "doctor.postTagsPlaceholder": "sleep, pain management, exercise",
    "doctor.aiAssistPlaceholder": "e.g., New research on sleep hygiene for fibromyalgia patients…",
    "doctor.postSubmitted": "Article submitted for review!",
    "doctor.postEditorDescription": "Write as a verified doctor — your post is reviewed before it appears to patients.",
    "doctor.postKindLabel": "Content type",
    "doctor.kind.article": "Article",
    "doctor.kind.research": "Research summary",
    "doctor.kind.status": "Status update",
    "doctor.socialFeedTitle": "Professional Feed",
    "doctor.socialFeedSubtitle": "Insights from the medical community",
    "doctor.composerPlaceholder": "Share an article, research, or clinical insight…",
    "doctor.feed.like": "Like",
    "doctor.feed.comment": "Comment",
    "doctor.feed.share": "Share",
    "doctor.filter.all": "All",
    "doctor.feed.searchPlaceholder": "Search titles, topics, authors…",
    "doctor.feed.searchLabel": "Search the feed",
    "doctor.feed.clearSearch": "Clear search",
    "doctor.feed.topicsLabel": "Topics",
    "doctor.feed.sortLabel": "Sort",
    "doctor.feed.sort.newest": "Newest",
    "doctor.feed.sort.popular": "Most liked",
    "doctor.feed.resultsCount": "Showing {count} of {total} posts",
    "doctor.feed.noResults": "No posts match your filters",
    "doctor.feed.noResultsHint": "Try a different keyword or remove a topic filter.",
    "doctor.feed.activeFilters": "Active filters",
    "doctor.feed.clearAll": "Clear all",
    "doctor.feed.filtersToggle": "Search & filters",
    "doctor.postMedia": "Media URL",
    "doctor.postContentStatus": "Status update",
    "doctor.postAiToggle": "AI assist — structure my notes",
    "doctor.postAiToggleDescription": "The AI organizes your raw clinical notes into a clear, evidence-backed draft (ACR/Mayo-aligned patient guidance). You review and edit everything before publishing.",
    "doctor.postSubmittedStatus": "Status update submitted for review!",
    "consultation.title": "Consultations",
    "consultation.subtitle": "Secure messaging with your care team",
    "consultation.newConsultation": "New Consultation",
    "consultation.subject": "Subject",
    "consultation.selectDoctor": "Select a Doctor",
    "consultation.startThread": "Start Conversation",
    "consultation.open": "Open",
    "consultation.closed": "Closed",
    "consultation.messages": "Messages",
    "consultation.typeMessage": "Type your message…",
    "consultation.hide": "Hide",
    "consultation.dismiss": "Dismiss",
    "consultation.structuredMessage": "Structured Message",
    "consultation.suggestedQuestions": "Suggested questions:",
    "consultation.noMessages": "No messages yet. Start the conversation below.",
    "consultation.unknown": "Unknown",
    "consultation.patientLabel": "Patient",
    "consultation.doctorLabel": "Doctor",
    "consultation.send": "Send",
    "consultation.noConsultations": "No consultations yet. Start a conversation with a verified doctor.",
    "consultation.patientAssistant": "Symptom Structurer",
    "consultation.patientAssistantDescription": "AI helps you organize your symptoms, medication history, and concerns into a clear, professional message for your doctor.",
    "consultation.clinicalSummary": "Clinical Summary Memo",
    "consultation.clinicalSummaryDescription": "AI-generated 30-day symptom and medication digest for the doctor.",
    "consultation.aiDraft": "AI Response Draft",
    "consultation.aiDraftDescription": "AI suggests a draft response based on the patient's message and clinical history.",
    "consultation.aiDisclaimer": "AI provides informational summaries only and does not replace direct clinical judgment.",
    "consultation.symptomHelper": "Structure My Symptoms",
    "consultation.symptomHelperDescription": "Describe how you're feeling and the AI will help you communicate it clearly to your doctor.",
    "consultation.symptomPlaceholder": "Describe how you've been feeling lately — your pain, sleep, energy, mood, any changes…",
    "consultation.noDoctorsAvailable": "No verified doctors available at this time.",
    "consultation.selectDoctorPlaceholder": "Select a doctor…",
    "consultation.subjectPlaceholder": "e.g., Follow-up on medication adjustment",
    "consultation.backToList": "Back to Consultations",
    "consultation.clinicalMemo": "Clinical Summary",
    "consultation.suggestedResponse": "Suggested Response",
    "consultation.useDraft": "Use This Draft",
    "pro.page.title": "FibroCare Pro",
    "pro.page.subtitle": "Unlock the full power of AI-assisted fibromyalgia management with your care team.",
    "pro.page.doctorHubTitle": "Doctor Hub",
    "pro.page.doctorHubDesc": "A dedicated space for verified doctors to publish trusted health articles and guidance for fibromyalgia patients.",
    "pro.page.consultationsTitle": "Direct Doctor Consultations",
    "pro.page.consultationsDesc": "A secure messaging room between you and your treating doctor — discuss symptoms, treatments, and progress privately.",
    "pro.page.aiCopilotTitle": "AI Medical Copilot",
    "pro.page.aiCopilotDesc": "AI-powered tools that summarize your 30-day health data for the doctor and help you structure medical questions with precision.",
    "pro.page.cta": "Upgrade to Pro",
    "pro.page.doctorHubBadge": "Doctor Hub",
    "pro.page.consultationsBadge": "Consultations",
    "pro.page.aiCopilotBadge": "AI Copilot",
    "symptomTracker.title": "Symptom Checklist",
    "symptomTracker.subtitle": "Track your symptoms to remember everything for your next doctor visit",
    "symptomTracker.selectSymptoms": "Select all that apply",
    "symptomTracker.notes": "Additional Notes",
    "symptomTracker.notesPlaceholder": "Add any details, triggers, or observations for your doctor...",
    "symptomTracker.generateReport": "Generate Doctor Summary Report",
    "symptomTracker.collapseAll": "Collapse All",
    "symptomTracker.expandAll": "Expand All",
    "symptomTracker.clearAll": "Clear All",
    "symptomTracker.totalChecked": "{count} symptoms checked",
    "symptomTracker.category.pain": "Pain Locations & Widespread Pain",
    "symptomTracker.category.physical": "General Physical & Neurological Symptoms",
    "symptomTracker.category.postExertional": "Post-Exertional & Trigger Fatigue",
    "symptomTracker.category.headFaceJaw": "Head, Face & Jaw",
    "symptomTracker.category.sensory": "Sensory & Associated Sensitivities",
    "symptomTracker.pain.neckShoulders": "Neck & Shoulders",
    "symptomTracker.pain.upperBack": "Upper Back",
    "symptomTracker.pain.lowerBackHips": "Lower Back & Hips",
    "symptomTracker.pain.armsElbows": "Arms & Elbows",
    "symptomTracker.pain.legsKnees": "Legs & Knees",
    "symptomTracker.pain.chestWall": "Chest Wall",
    "symptomTracker.physical.severeFatigue": "Severe Fatigue",
    "symptomTracker.physical.morningStiffness": "Morning Stiffness",
    "symptomTracker.physical.sleepDisturbances": "Sleep Disturbances / Insomnia",
    "symptomTracker.physical.numbnessTingling": "Numbness & Tingling in Hands/Feet",
    "symptomTracker.physical.rls": "Restless Legs Syndrome (RLS)",
    "symptomTracker.physical.burningColdSensations": "Burning / Cold Sensations in Legs",
    "symptomTracker.postExertional.postShower": "Post-Shower Fatigue",
    "symptomTracker.postExertional.postMeal": "Post-Meal Fatigue & Flare-Ups",
    "symptomTracker.postExertional.exhaustionGoingOut": "Exhaustion After Going Out",
    "symptomTracker.head.fibroFog": "Fibro Fog & Concentration Issues",
    "symptomTracker.head.memoryLapses": "Memory Lapses",
    "symptomTracker.head.tensionHeadaches": "Tension Headaches & Migraines",
    "symptomTracker.head.tmjJawPain": "TMJ / Jaw Pain",
    "symptomTracker.head.facialTension": "Facial Tension & Eye Strain",
    "symptomTracker.sensory.lightNoise": "Sensitivity to Light / Noise / Temperature",
    "symptomTracker.sensory.ibsDigestive": "IBS & Digestive Issues",
    "symptomTracker.sensory.palpitationsDizziness": "Palpitations / Dizziness",
    "symptomTracker.sensory.moodAnxiety": "Mood Changes & Anxiety",
    "doctorReport.title": "Doctor Visit Summary Report",
    "doctorReport.subtitle": "Your symptom summary for your healthcare provider",
    "doctorReport.close": "Close",
    "doctorReport.patientInfo": "Patient Information",
    "doctorReport.date": "Date",
    "doctorReport.painLevel": "Pain Level",
    "doctorReport.energyMood": "Energy & Mood",
    "doctorReport.checkedSymptoms": "Reported Symptoms",
    "doctorReport.category": "Category",
    "doctorReport.notes": "Patient Notes",
    "doctorReport.noSymptoms": "No symptoms selected",
    "doctorReport.noNotes": "No notes added",
    "doctorReport.noSymptomsMessage": "The patient has not selected any symptoms for this visit.",
    "doctorReport.noNotesMessage": "No additional notes were provided.",
    "doctorReport.copyToClipboard": "Copy to Clipboard",
    "doctorReport.copied": "Copied!",
    "doctorReport.printReport": "Print Report",
    "doctorReport.disclaimer": "This report was generated by the patient using FibroCare and is not a medical diagnosis. Please review with your healthcare provider.",
    "nav.diet": "Diet & Triggers",
    "diet.title": "Dietary Trigger Tracker",
    "diet.subtitle": "Log your meals, keep your personal trigger list, and see how evening eating links to your next-morning symptoms.",
    "diet.energy.exhausted": "Exhausted",
    "diet.energy.low": "Low energy",
    "diet.energy.moderate": "Moderate",
    "diet.energy.good": "Good",
    "diet.energy.full": "Full energy",
    "diet.logger.title": "Log a Meal",
    "diet.logger.subtitle": "Real-time flare warnings as you type your foods.",
    "diet.logger.date": "Date",
    "diet.logger.time": "Time",
    "diet.logger.mealType": "Meal type",
    "diet.logger.mealType.breakfast": "Breakfast",
    "diet.logger.mealType.lunch": "Lunch",
    "diet.logger.mealType.dinner": "Dinner",
    "diet.logger.mealType.snack": "Snack",
    "diet.logger.foods": "Foods eaten",
    "diet.logger.foodsPlaceholder": "e.g. Grilled salmon, steamed broccoli",
    "diet.logger.amount": "Amount",
    "diet.logger.amountPlaceholder": "e.g. 1 bowl, 150 g",
    "diet.logger.addFood": "Add food",
    "diet.logger.energyBefore": "Energy before this meal",
    "diet.logger.energyBefore.hint": "0 = exhausted · 4 = full energy",
    "diet.logger.notes": "Notes",
    "diet.logger.notesPlaceholder": "How did you feel after this meal?",
    "diet.logger.save": "Save meal",
    "diet.logger.saving": "Saving…",
    "diet.logger.saved": "Meal saved",
    "diet.logger.delete": "Delete",
    "diet.logger.noMeals": "No meals logged for this date yet.",
    "diet.logger.mealsLabel": "Logged meals",
    "diet.warn.known.gluten": "Gluten (wheat, bread, pasta)",
    "diet.warn.known.dairy": "Dairy (milk, cheese, yogurt)",
    "diet.warn.known.sugar": "Refined sugar & sweets",
    "diet.warn.known.fried": "Fried foods",
    "diet.warn.known.processed": "Processed & fast foods",
    "diet.warn.known.alcohol": "Alcohol",
    "diet.warn.known.caffeine": "Caffeine",
    "diet.warn.personal": "You listed this as a personal trigger",
    "diet.warnings.none": "No known triggers detected — nice choice.",
    "diet.warnings.some": "Possible trigger(s) in this meal",
    "diet.warnings.swap": "Swap idea",
    "diet.warnings.reason": "Why",
    "diet.swap.gluten.swap": "Swap for gluten-free oats or rice",
    "diet.swap.gluten.reason": "Gluten can drive fatigue and joint stiffness in sensitive people.",
    "diet.swap.dairy.swap": "Swap for oat or almond milk",
    "diet.swap.dairy.reason": "Dairy is a common fibromyalgia food sensitivity.",
    "diet.swap.sugar.swap": "Swap refined sugar for dates or berries",
    "diet.swap.sugar.reason": "Sugar spikes can amplify afternoon crashes.",
    "diet.swap.fried.swap": "Choose baked or air-fried options",
    "diet.swap.fried.reason": "Fried foods add inflammatory fats that may worsen pain.",
    "diet.swap.processed.swap": "Choose a whole-food alternative",
    "diet.swap.processed.reason": "Ultra-processed foods often hide pro-inflammatory additives.",
    "diet.swap.alcohol.swap": "Swap for sparkling water with lime",
    "diet.swap.alcohol.reason": "Alcohol can disrupt deep sleep, fueling next-day fatigue.",
    "diet.swap.caffeine.swap": "Swap for herbal or decaf tea",
    "diet.swap.caffeine.reason": "Late caffeine can delay sleep and worsen fibro fog.",
    "diet.timing.veryLow.title": "Eat small & early tonight",
    "diet.timing.veryLow.reason": "Very low energy — a light dinner before 19:00 supports better recovery.",
    "diet.timing.low.title": "Aim for an earlier dinner",
    "diet.timing.low.reason": "Try finishing dinner before 20:00 to protect your sleep window.",
    "diet.timing.moderate.title": "Keep a steady evening meal",
    "diet.timing.moderate.reason": "A balanced dinner with protein and vegetables supports stable energy.",
    "diet.timing.good.title": "You're in a good window",
    "diet.timing.good.reason": "Keep your usual balanced dinner and stay hydrated.",
    "diet.timing.full.title": "Full energy — keep it nourishing",
    "diet.timing.full.reason": "Great energy today — a nutrient-rich dinner sustains tomorrow.",
    "diet.triggers.title": "My Trigger Foods",
    "diet.triggers.subtitle": "Foods that tend to bring on your flare-ups — we'll flag them whenever they appear in a meal.",
    "diet.triggers.name": "Food name",
    "diet.triggers.severity": "Severity",
    "diet.triggers.severity.hint": "1 = mild · 5 = severe reaction",
    "diet.triggers.severity.level1": "Mild",
    "diet.triggers.severity.level2": "Mild–moderate",
    "diet.triggers.severity.level3": "Moderate",
    "diet.triggers.severity.level4": "Strong",
    "diet.triggers.severity.level5": "Severe",
    "diet.triggers.reactionNote": "How does it affect you?",
    "diet.triggers.reactionNotePlaceholder": "e.g. Next-day fatigue, joint pain",
  "diet.triggers.namePlaceholder": "e.g. Garlic, citrus, red wine",
    "diet.triggers.add": "Add to my list",
    "diet.triggers.adding": "Adding…",
    "diet.triggers.empty": "No personal triggers yet — add foods you've noticed set you back.",
    "diet.triggers.remove": "Remove",
    "diet.triggers.removed": "Trigger removed",
    "diet.correlation.title": "Next-Day Flare Correlation",
    "diet.correlation.subtitle": "Evening meals vs. your next-morning symptoms — a pattern hint, not a diagnosis.",
    "diet.correlation.disclaimer": "Correlation only — not a medical diagnosis.",
    "diet.correlation.empty": "Log a few evening meals (with pain or symptom logs the next day) and this panel will find patterns.",
    "diet.correlation.baseline": "Baseline next-day score",
    "diet.correlation.baseline.hint": "Average symptom score after any evening meal",
    "diet.correlation.food": "Food",
    "diet.correlation.with": "Score after eating it",
    "diet.correlation.without": "Score without it",
    "diet.correlation.lift": "Lift",
    "diet.correlation.outOf": "out of 10",
    "diet.correlation.evenings": "Evenings",
    "diet.correlation.risk.high": "High suspicion",
    "diet.correlation.risk.moderate": "Moderate suspicion",
    "diet.correlation.risk.watch": "Watch",
    "diet.correlation.risk.high.hint": "Strongly linked with your next-morning symptoms in your logs.",
    "diet.correlation.risk.moderate.hint": "May be linked — worth testing consciously.",
    "diet.correlation.risk.watch.hint": "Too few samples or no clear signal yet.",
    "diet.correlation.timing.title": "Dinner timing",
    "diet.correlation.timing.highFlare": "Avg. dinner hour on flare mornings",
    "diet.correlation.timing.lowFlare": "Avg. dinner hour on calm mornings",
    "diet.correlation.timing.later": "Later dinners tend to track with next-morning flare-ups. Try eating before {hour}:00 to protect your sleep.",
    "diet.correlation.timing.nodata": "Not enough data yet.",

    "clinical.acr.title": "ACR Assessment",
    "clinical.acr.subtitle": "A self-check against the ACR 2010/2016 criteria — a screening aid, not a diagnosis.",
    "clinical.acr.ss.level.0": "No symptoms",
    "clinical.acr.ss.level.1": "Mild",
    "clinical.acr.ss.level.2": "Moderate",
    "clinical.acr.ss.level.3": "Severe",
    "clinical.acr.wpi.title": "Widespread Pain Index (WPI)",
    "clinical.acr.wpi.subtitle": "Tap every area that was painful in the last 7 days.",
    "clinical.acr.wpi.count": "{count} of 19 areas selected",
    "clinical.acr.ss.title": "Symptom Severity (SS) score",
    "clinical.acr.ss.hint": "Rate each dimension over the past week.",
    "clinical.acr.ss.fatigue": "Fatigue",
    "clinical.acr.ss.unrefreshed": "Waking unrefreshed",
    "clinical.acr.ss.cognitive": "Cognitive symptoms",
    "clinical.acr.somatic.title": "Somatic symptom checklist",
    "clinical.acr.somatic.subtitle": "Tick symptoms you have experienced recently.",
    "clinical.acr.somatic.bandHint": "{count} selected → severity band: {band}",
    "clinical.acr.duration.title": "Duration",
    "clinical.acr.duration.label": "Symptoms have been present at a similar level for at least 3 months.",
    "clinical.acr.evaluate": "Evaluate",
    "clinical.acr.result.criteriaMet": "Criteria met",
    "clinical.acr.result.criteriaNotMet": "Criteria not fully met",
    "clinical.acr.result.interpretation": "This reflects your answers to the ACR screening questions — not a medical diagnosis.",
    "clinical.acr.result.wpi": "WPI",
    "clinical.acr.result.ss": "SS",
    "clinical.acr.result.generalized": "Generalized",
    "clinical.acr.result.scoreRule": "Score rule",
    "clinical.acr.result.duration": "Duration ≥ 3 months",
    "clinical.acr.result.met": "Met",
    "clinical.acr.result.notMet": "Not met",
    "clinical.acr.summaryTitle": "Summary for your doctor",
    "clinical.acr.summary.wpi": "painful areas out of 19",
    "clinical.acr.summary.ss": "Symptom Severity",
    "clinical.acr.summary.generalized": "Generalized regions",
    "clinical.acr.summary.scoreRule": "Score rule",
    "clinical.acr.summary.duration": "Duration",
    "clinical.acr.summary.criteria": "ACR criteria",
    "clinical.acr.savedToProfile": "Saved to profile",
    "clinical.acr.signInHint": "Sign in to save",
    "clinical.acr.saveToProfile": "Save to profile",
    "clinical.acr.savedToProfileHint": "Saved to your profile. You can share it with your doctor.",
    "clinical.acr.signInHintBody": "By saving, you can share this snapshot with your doctor. Please sign in first.",
    "clinical.acr.shareError": "Something went wrong while saving. Please try again.",
    "clinical.acr.disclaimer": "Screening aid only — it is not a diagnosis. Discuss the results with a qualified clinician.",

    "clinical.somatic.headache": "Headache",
    "clinical.somatic.lowerAbdomenPain": "Pain or cramps in the lower abdomen",
    "clinical.somatic.depression": "Depression",
    "clinical.somatic.constipation": "Constipation",
    "clinical.somatic.diarrhea": "Diarrhea",
    "clinical.somatic.nausea": "Nausea",
    "clinical.somatic.dizziness": "Dizziness",
    "clinical.somatic.tingling": "Tingling / numbness",
    "clinical.somatic.irritableBowel": "Irritable bowel syndrome",
    "clinical.somatic.tinnitus": "Tinnitus",
    "clinical.somatic.blurredVision": "Blurred vision",
    "clinical.somatic.chestPain": "Chest pain",
    "clinical.somatic.dryMouth": "Dry mouth",
    "clinical.somatic.mouthUlcers": "Mouth ulcers",
    "clinical.somatic.skinSensitivity": "Skin sensitivity",
    "clinical.somatic.anxiety": "Anxiety",
    "clinical.somatic.restlessLegs": "Restless legs",
    "clinical.somatic.coldIntolerance": "Cold intolerance",

    "clinical.wpi.shoulderL": "Shoulder — left",
    "clinical.wpi.shoulderR": "Shoulder — right",
    "clinical.wpi.upperArmL": "Upper arm — left",
    "clinical.wpi.upperArmR": "Upper arm — right",
    "clinical.wpi.lowerArmL": "Lower arm — left",
    "clinical.wpi.lowerArmR": "Lower arm — right",
    "clinical.wpi.hipL": "Hip — left",
    "clinical.wpi.hipR": "Hip — right",
    "clinical.wpi.upperLegL": "Upper leg — left",
    "clinical.wpi.upperLegR": "Upper leg — right",
    "clinical.wpi.lowerLegL": "Lower leg — left",
    "clinical.wpi.lowerLegR": "Lower leg — right",
    "clinical.wpi.jawL": "Jaw — left",
    "clinical.wpi.jawR": "Jaw — right",
    "clinical.wpi.chest": "Chest",
    "clinical.wpi.abdomen": "Abdomen",
    "clinical.wpi.neck": "Neck",
    "clinical.wpi.upperBack": "Upper back",
    "clinical.wpi.lowerBack": "Lower back",

    "clinical.meds.title": "Medications & Supplements",
    "clinical.meds.subtitle": "Track your doses and daily adherence — informational, not treatment advice.",
    "clinical.meds.due": "Due now",
    "clinical.meds.dueEmpty": "Nothing due right now. Keep a regular rhythm.",
    "clinical.meds.taken": "Taken ✓",
    "clinical.meds.markTaken": "Mark taken",
    "clinical.meds.adherence": "7-day adherence",
    "clinical.meds.mySchedule": "My schedule",
    "clinical.meds.empty": "Your schedule is empty. Add common medications and supplements below.",
    "clinical.meds.remove": "Remove {name}",
    "clinical.meds.addTitle": "Add from the common list",
    "clinical.meds.add": "Add",
    "clinical.meds.addAria": "Add {name} to my schedule",
    "clinical.meds.disclaimer": "Informational only — never stop, start or change medication without your prescriber.",
    "clinical.meds.frequency.once": "Once daily",
    "clinical.meds.frequency.twice": "Twice daily",
    "clinical.meds.frequency.threeTimes": "Three times daily",
    "clinical.meds.frequency.asNeeded": "As needed",

    "clinical.trigger.title": "Flare Triggers Log",
    "clinical.trigger.subtitle": "Learn which factors tend to accompany your strongest flares.",
    "clinical.trigger.date": "Date",
    "clinical.trigger.severity": "Severity",
    "clinical.trigger.severityHint": "0 = no flare · 10 = worst flare you have felt",
    "clinical.trigger.factors": "Suspect factors",
    "clinical.trigger.note": "Note",
    "clinical.trigger.notePlaceholder": "What was going on? Weather, stress, activities…",
    "clinical.trigger.addEntry": "Add entry",
    "clinical.trigger.added": "Added ✓",
    "clinical.trigger.insights": "Your patterns so far",
    "clinical.trigger.frequencyLabel": "{count} logged",
    "clinical.trigger.avgSeverity": "avg {avg}/10",
    "clinical.trigger.history": "History",
    "clinical.trigger.empty": "No entries yet. Log your first flare to start spotting patterns.",
    "clinical.trigger.delete": "Delete entry",
    "clinical.trigger.group.weather": "Weather",
    "clinical.trigger.group.stress": "Stress & emotions",
    "clinical.trigger.group.sleep": "Sleep",
    "clinical.trigger.group.diet": "Diet",
    "clinical.trigger.group.activity": "Activity",
    "clinical.trigger.group.other": "Other",
    "clinical.trigger.weatherPressure": "Pressure / weather change",
    "clinical.trigger.cold": "Cold",
    "clinical.trigger.heat": "Heat",
    "clinical.trigger.stress": "Stress",
    "clinical.trigger.poorSleep": "Poor sleep",
    "clinical.trigger.overexertion": "Overexertion",
    "clinical.trigger.dietary": "Diet (e.g. sugar, alcohol)",
    "clinical.trigger.sittingTooLong": "Sitting too long",
    "clinical.trigger.hormonal": "Hormonal changes",
    "clinical.trigger.illness": "Illness / infection",

    "clinical.lab.title": "Lab Results & Biomarkers",
    "clinical.lab.subtitle": "Track the classic 'rule out overlap' bloodwork: thyroid, vitamin D, ESR and CRP.",
    "clinical.lab.latestNone": "No results yet",
    "clinical.lab.test": "Test",
    "clinical.lab.date": "Date",
    "clinical.lab.value": "Value",
    "clinical.lab.valueRequired": "Enter a numeric value to add a result.",
    "clinical.lab.hint": "Hint: {hint}",
    "clinical.lab.reference": "Reference range: {low}–{high} {unit}",
    "clinical.lab.note": "Note (optional)",
    "clinical.lab.notePlaceholder": "Lab, fasting status, symptoms around the draw…",
    "clinical.lab.add": "Add result",
    "clinical.lab.history": "History",
    "clinical.lab.empty": "No results logged yet. Add your latest bloodwork above.",
    "clinical.lab.delete": "Delete result",
    "clinical.lab.disclaimer": "Informational only — always review results with your clinician.",
    "clinical.lab.verdict.low": "Low",
    "clinical.lab.verdict.inRange": "In range",
    "clinical.lab.verdict.high": "High",
    "clinical.lab.tsh.label": "TSH",
    "clinical.lab.tsh.hint": "Standard thyroid screening value.",
    "clinical.lab.ft4.label": "Free T4",
    "clinical.lab.ft4.hint": "Free thyroxine.",
    "clinical.lab.vitaminD.label": "Vitamin D",
    "clinical.lab.vitaminD.hint": "25-Hydroxyvitamin D.",
    "clinical.lab.esr.label": "ESR",
    "clinical.lab.esr.hint": "Erythrocyte sedimentation rate.",
    "clinical.lab.crp.label": "CRP",
    "clinical.lab.crp.hint": "C-reactive protein.",

    "toolkit.clinicalTitle": "Clinical Centre",
    "toolkit.clinicalSubtitle": "Self-assessments and trackers that help you prepare for appointments and rule out overlapping conditions.",

    "fog.title": "Fog Shield",
    "fog.hero.kicker": "Cognitive emergency toolkit",
    "fog.hero.subtitle": "When brain fog rolls in, this page helps you ride it out: settle your breath, dump the static, shrink one task, or run the SOS protocol.",
    "fog.hero.fogGuide": "Use any tool below — the fog lifts as you settle.",
    "fog.hero.clearGuide": "You're clear. Come back any time the static returns.",
    "fog.hero.statEpisodes": "Episodes logged",
    "fog.hero.statAvg": "Average intensity",
    "fog.hero.statRecent": "Recent trend",
    "fog.hero.statNone": "No data yet",
    "fog.hero.privacy": "Private by design —",
    "fog.hero.privacyDetail": "brain dumps are encrypted at rest and readable only by you.",
    "fog.sos.title": "Fog SOS",
    "fog.sos.subtitle": "This is scary, not just hard. Work the four steps in order.",
    "fog.sos.step1": "Sit or lie down somewhere safe",
    "fog.sos.step1desc": "Stop what you're doing. You don't have to finish anything right now.",
    "fog.sos.step2": "Sip water slowly",
    "fog.sos.step2desc": "Dehydration amplifies fog and dizziness more than anything else.",
    "fog.sos.step3": "Look at one fixed point and breathe",
    "fog.sos.step3desc": "Hold your gaze on something still until the room stops spinning.",
    "fog.sos.step4": "Tell one trusted person",
    "fog.sos.step4desc": "One short message is enough: \"Fog episode, I'm resting, I'm safe.\"",
    "fog.sos.callClinic": "Call my clinic",
    "fog.sos.callTrusted": "Call my person",
    "fog.sos.steady": "I'm steadier now",
    "fog.sos.steadier": "Glad it's easing. The steps stay here whenever you need them.",
    "fog.sos.emergency": "If you have chest pain, faint, or can't speak or move — call emergency services immediately.",
    "fog.breath.title": "Breath reset",
    "fog.breath.subtitle": "Long exhales tell your nervous system the emergency is over.",
    "fog.breath.start": "Start",
    "fog.breath.pause": "Pause",
    "fog.breath.reset": "Reset",
    "fog.breath.seconds": "seconds",
    "fog.breath.cycles": "cycles",
    "fog.breath.sessionComplete": "Session complete — nice work.",
    "fog.breath.inhale": "Breathe in",
    "fog.breath.hold": "Hold",
    "fog.breath.exhale": "Breathe out",
    "fog.breath.pattern478": "4-7-8 calming",
    "fog.breath.patternBox": "Box breathing",
    "fog.dump.title": "Brain dump",
    "fog.dump.subtitle": "Empty the swirling thoughts onto the page. They don't have to make sense.",
    "fog.dump.intensity": "Fog intensity",
    "fog.dump.triggers": "What might be feeding it",
    "fog.dump.where": "Where your head is right now",
    "fog.dump.noTriggers": "Nothing selected",
    "fog.dump.save": "Save this dump",
    "fog.dump.saving": "Saving…",
    "fog.dump.saved": "Dumped. It's out of your head and locked away.",
    "fog.dump.clear": "Clear",
    "fog.dump.chars": "characters",
    "fog.dump.needsOne": "Write a thought or pick at least one trigger first.",
    "fog.dump.recent": "Recent dumps",
    "fog.save.locked": "Unlock FibroCare to save your fog log.",
    "fog.save.invalid": "Please complete the fog log correctly.",
    "fog.save.failed": "Failed to save your fog log. Please try again.",
    "fog.microtask.title": "Micro-task shrinker",
    "fog.microtask.subtitle": "One task that feels too big right now — three steps small enough to survive.",
    "fog.microtask.prompt": "What feels too big right now?",
    "fog.microtask.placeholder": "e.g. answer the insurance email…",
    "fog.microtask.breakdown": "Shrink it to 3 steps",
    "fog.microtask.newTask": "Shrink another task",
    "fog.microtask.allDone": "All three done — that was the whole task.",
    "fog.microtask.step": "Step",
    "fog.microtask.theTask": "this task",
    "fog.microtask.assist1": "Open whatever \"{task}\" needs — just open it.",
    "fog.microtask.assist2": "Do the smallest visible piece for one minute.",
    "fog.microtask.assist3": "Stop and let it rest — started is done for now.",
    "fog.microtask.saveToggle": "Log this session",
    "fog.microtask.saved": "Saved to your fog log.",
    "fog.trigger.lowSleep": "Poor sleep",
    "fog.trigger.stress": "Stress",
    "fog.trigger.screen": "Long screen time",
    "fog.trigger.noise": "Noise / crowds",
    "fog.trigger.lowFood": "Haven't eaten",
    "fog.trigger.medication": "Missed medication",
    "fog.trigger.menstrual": "Hormonal phase",
    "fog.trigger.weather": "Weather change",
    "fog.trigger.overdid": "Overdid activity",
    "fog.trigger.overwhelm": "Too much at once",
    "fog.trigger.multitasking": "Multitasking",
    "fog.trigger.other": "Something else",
    "quickActions.fog.title": "Fog Shield",
    "quickActions.fog.description": "Grounding tools for brain-fog episodes",
    "toolkit.fogCard.title": "Fog Shield",
    "toolkit.fogCard.subtitle": "Breathe out the fog, dump the static, split one hard task — right here.",
    "toolkit.fogCard.open": "Open Fog Shield",
    "sos.fab": "Open SOS crisis help",
    "sos.dismissFab": "Hide crisis help button",
    "sos.modal.title": "SOS — Flare support",
    "sos.modal.subtitle": "You are not alone. One step at a time.",
    "sos.close": "Close",
    "sos.breath.title": "Slow breathing countdown",
    "sos.breath.hint": "Follow the phase label. Long exhales calm the nervous system.",
    "sos.breath.done": "Well done — your breathing has slowed.",
    "sos.message.title": "Tell someone what's happening",
    "sos.message.body": "I am experiencing an unexpected fibromyalgia flare right now. I may need help with daily tasks or company. No need to panic — I am resting and following my flare plan.",
    "sos.message.share": "Share",
    "sos.message.copy": "Copy",
    "sos.guide.title": "Dizzy or disoriented? Do this now",
    "sos.guide.sit": "Sit or lie down immediately — do not push through.",
    "sos.guide.head": "Move slowly. Turning your head fast worsens dizziness.",
    "sos.guide.sip": "Sip water and have a small salty snack if available.",
    "sos.guide.call": "If it lasts over 30 minutes or worsens — call someone.",
    "sos.emergencyCall": "Call emergency",
    "sos.privacyNote": "Nothing here is sent to FibroCare servers — sharing happens on your device only.",
    "spoon.checkin.title": "Daily energy check-in",
    "spoon.checkin.subtitle": "Spoon Theory — budget your energy like money.",
    "spoon.checkin.question": "How many energy spoons do you have today?",
    "spoon.checkin.guide.ask": "Pick today's number — it shapes the rest of the app around your energy.",
    "spoon.checkin.guide.spend": "Enough for what matters. Choose one or two big things and let the rest wait.",
    "spoon.checkin.guide.rest": "Rest is the task today. Everything else can wait — this is not failure.",
    "spoon.checkin.mode.spend": "Energy Saving Mode: off",
    "spoon.checkin.mode.rest": "Energy Saving Mode: ON",
    "spoon.checkin.savedNote": "Saved to your energy log for today.",
    "spoon.checkin.saving": "Saving…",
    "spoon.checkin.week": "Last 7 days",
    "spoon.checkin.signInRequired": "You must be signed in.",
    "spoon.checkin.locked": "Unlock FibroCare to save your energy check-in.",
    "spoon.checkin.invalid": "Spoons must be between 1 and 10.",
    "spoon.checkin.failed": "Could not save your energy check-in.",
    "pantry.title": "Pantry meal helper",
    "pantry.subtitle": "One-click anti-inflammatory meals for low-energy days — 5 minutes, no decisions.",
    "pantry.haveQuestion": "What's in your kitchen right now?",
    "pantry.loading": "Loading your pantry…",
    "pantry.noMatch": "Tick a few ingredients above and quick meals will appear here.",
    "pantry.bestMatch": "Best match — start here",
    "pantry.minutes": "{count} min",
    "pantry.disclaimer": "General food ideas, not medical or dietary advice — follow your clinician's plan.",
    "pantry.ing.oats": "Oats",
    "pantry.ing.oliveOil": "Olive oil",
    "pantry.ing.fattyFish": "Canned fish",
    "pantry.ing.leafyGreens": "Leafy greens",
    "pantry.ing.berries": "Berries",
    "pantry.ing.nuts": "Nuts / seeds",
    "pantry.ing.yogurt": "Yogurt",
    "pantry.ing.turmeric": "Turmeric",
    "pantry.ing.ginger": "Ginger",
    "pantry.ing.eggs": "Eggs",
    "pantry.ing.bananas": "Bananas",
    "pantry.ing.wholeGrainBread": "Whole-grain bread",
    "pantry.meal.oatBerryBowl": "Warm oat & berry bowl",
    "pantry.meal.oatBerryBowl.how": "Soak oats in hot water or milk 2 min, top with berries and a handful of nuts. Slow carbs + antioxidants calm morning stiffness.",
    "pantry.meal.turmericYogurtBowl": "Golden yogurt bowl",
    "pantry.meal.turmericYogurtBowl.how": "Stir a pinch of turmeric and a squeeze of honey into yogurt, top with berries. Quick anti-inflammatory protein hit.",
    "pantry.meal.toastAvocadoSpinach": "Green toast",
    "pantry.meal.toastAvocadoSpinach.how": "Toast bread, pile on greens with a thread of olive oil and a pinch of salt. Magnesium-rich greens ease muscle tension.",
    "pantry.meal.sardineToast": "Sardine toast",
    "pantry.meal.sardineToast.how": "Mash canned sardines onto toast, crown with greens. Omega-3s are the most evidence-backed anti-inflammatory fat.",
    "pantry.meal.gingerBananaSmoothie": "Ginger-banana smoothie",
    "pantry.meal.gingerBananaSmoothie.how": "Blend banana, yogurt, a thumb of ginger and water/milk. Ginger soothes nausea that rides along with flares.",
    "pantry.meal.eggGreenScramble": "Two-minute green eggs",
    "pantry.meal.eggGreenScramble.how": "Scramble eggs in olive oil, wilt greens in at the end. Protein + greens without standing long at the stove.",
    "family.title": "Family support cards",
    "family.subtitle": "Pre-written explainers for the people around you — say it once, not ten times.",
    "family.shareTitle": "A note from me (FibroCare)",
    "family.copy": "Copy",
    "family.copied": "Copied!",
    "family.copyFailed": "Copy failed — select the text and copy manually.",
    "family.share": "Share",
    "family.privacyNote": "Cards copy/share from your device only — FibroCare servers never see them.",
    "family.card.flare.title": "🔥 I'm having a flare",
    "family.card.flare.body": "My fibromyalgia is flaring right now: pain and exhaustion spiked, and it's not something I can push through. I'll be resting — I'd love soup, a ride, or a quiet check-in message. No need to visit or call repeatedly. It passes; it just needs time.",
    "family.card.fog.title": "🌫 I'm having a brain-fog episode",
    "family.card.fog.body": "My thinking is cloudy right now (fibro fog): words slip, focus drifts, decisions feel huge. It's temporary and it's not me being careless. Simple, short messages help; please don't quiz me or add tasks right now. I'll be back when it clears.",
    "family.card.crash.title": "🔋 I'm out of energy today",
    "family.card.crash.body": "I've used up today's energy and my body demands full rest. Canceling plans isn't giving up — it's how I protect tomorrow. Please handle anything urgent for me, and let's reschedule when I'm recharged.",
    "movement.title": "Movement reminders",
    "movement.off": "Off",
    "movement.minutes": "{count} min",
    "movement.popup.title": "Time for a tiny stretch",
    "movement.done": "Done — nice",
    "movement.snooze": "Snooze 10 min",
    "movement.dismiss": "Dismiss reminder",
    "movement.stretch.neck": "Slowly roll your right ear toward your right shoulder; count 4 breaths. Switch sides.",
    "movement.stretch.shoulders": "Roll both shoulders back in slow circles — 5 rounds, exhaling on each drop.",
    "movement.stretch.wrists": "Arms out: circle your wrists 5 times each way, then spread and close your fingers.",
    "movement.stretch.hips": "Standing or seated: shift weight side to side gently, 6 slow shifts.",
    "movement.stretch.calves": "Rise to tiptoes and lower slowly, 6 times — wake up circulation without strain.",
    "support.title": "Daily-life support",
    "support.subtitle": "Explainers for the people around you, and gentle nudges to keep your muscles kind.",
    "summary.title": "Doctor-ready summary",
    "summary.subtitle": "One clean page for your next appointment — no more relying on memory through the fog.",
    "summary.loading": "Preparing your summary…",
    "summary.unavailable": "Your summary appears here once you're signed in and unlocked.",
    "summary.heading": "Fibromyalgia self-tracking summary — {name}",
    "summary.line.period": "Tracked {count} days with symptoms over the last {days} days.",
    "summary.line.avgPain": "Average pain {value}/10",
    "summary.line.peakPain": "peak {value}/10",
    "summary.line.flareDays": "{count} flare days (pain ≥ 7/10)",
    "summary.line.cycleDays": "{count} menstrual log days in the period",
    "summary.line.symptomAvg": "Average symptom severity {value}/10",
    "summary.line.adherence": "Symptoms logged on {count} of the last 30 days",
    "summary.line.meds": "Current medications/supplements: {meds}",
    "summary.line.medsNone": "No medication list saved yet — add it in the Clinical Centre before your visit.",
    "summary.generated": "Generated {date} · self-reported data from FibroCare",
    "summary.print": "Print / save as PDF",
    "summary.none": "n/a",
    "nav.clinical": "Clinical Hub",
    "clinical.hub.title": "Clinical Hub",
    "clinical.hub.subtitle": "Assessments, trackers, therapeutic guidance and a doctor-ready report — everything clinical in one place.",
    "clinical.hub.trackersTitle": "Assessments & Trackers",
    "clinical.hub.trackersSubtitle": "Structured self-assessments and daily logs that build your appointment kit.",
    "clinical.hub.lifestyleTitle": "Therapeutic & Lifestyle",
    "clinical.hub.lifestyleSubtitle": "Evidence-aligned guidance you can act on today: movement, sleep and flare coping.",
    "clinical.hub.reportTitle": "Weekly / Monthly Report",
    "clinical.hub.reportSubtitle": "Aggregates your logs, trackers and cycle context into a copy-ready summary for your doctor.",

    "clinical.exercise.title": "Low-Impact Exercise Library",
    "clinical.exercise.subtitle": "Gentle, graded movement guides. Start low, go slow, and pace every session.",
    "clinical.exercise.filter.all": "All levels",
    "clinical.exercise.intensity.gentle": "Gentle",
    "clinical.exercise.intensity.light": "Light",
    "clinical.exercise.intensity.moderate": "Moderate",
    "clinical.exercise.minutes": "{count} min",
    "clinical.exercise.stepsLabel": "How to do it",
    "clinical.exercise.clearance": "Check with your clinician before starting",
    "clinical.exercise.tipsTitle": "Pacing principles",
    "clinical.exercise.tip.1": "Start at half of what you think you can do, then build by ~10% a week.",
    "clinical.exercise.tip.2": "Stop while you still have energy — pushing to exhaustion costs days.",
    "clinical.exercise.tip.3": "A short flare after a new activity is common; a multi-day crash means doing less.",
    "clinical.exercise.tip.4": "Gentle daily movement beats occasional intense sessions.",
    "clinical.exercise.walking.title": "Gentle Walking",
    "clinical.exercise.walking.details": "The most accessible aerobic base — flat routes, comfortable shoes, and a pace where you can still talk.",
    "clinical.exercise.walking.steps": "1. Pick a flat, shaded loop near home.\n2. Walk 3–5 minutes, then rest or turn back.\n3. Add 1–2 minutes only on days you feel steady.\n4. Track how you feel the next morning before extending.",
    "clinical.exercise.water.title": "Warm Water Exercise",
    "clinical.exercise.water.details": "Buoyancy unloads painful joints while gentle resistance builds strength — the best-tolerated exercise in fibromyalgia studies.",
    "clinical.exercise.water.steps": "1. Choose a warm pool (32–34°C when possible).\n2. Walk the shallow end width-wise for 5 minutes.\n3. Add slow leg swings and shoulder circles.\n4. Stop before you feel cold or tired.",
    "clinical.exercise.taiChi.title": "Tai Chi",
    "clinical.exercise.taiChi.details": "Slow, flowing patterns that train balance and calm breathing; strong trial evidence for fibromyalgia symptom relief.",
    "clinical.exercise.taiChi.steps": "1. Begin with the opening warm-up form only.\n2. Follow a beginner video or class at half speed.\n3. Keep knees soft — never locked.\n4. Practice 10–20 minutes, 2–3 times a week.",
    "clinical.exercise.yoga.title": "Gentle Yoga",
    "clinical.exercise.yoga.details": "Restorative poses with props and long holds; emphasize breath and comfort over depth of stretch.",
    "clinical.exercise.yoga.steps": "1. Use a chair or wall for support in every standing pose.\n2. Hold poses 30–60 seconds without straining.\n3. Favor restorative poses: child's pose, legs-up-the-wall.\n4. Skip hot yoga and fast vinyasa flows.",
    "clinical.exercise.stretching.title": "Daily Stretching",
    "clinical.exercise.stretching.details": "A 10-minute full-body routine keeps morning stiffness manageable — the single most-reported relief habit.",
    "clinical.exercise.stretching.steps": "1. Stretch after a warm shower when muscles are warm.\n2. Hold each stretch 20–30 seconds; never bounce.\n3. Breathe slowly and exhale into the stretch.\n4. Cover neck, shoulders, back, hips and calves.",
    "clinical.exercise.strength.title": "Light Strength Work",
    "clinical.exercise.strength.details": "Light resistance protects muscle and bone. Only start once daily activity feels manageable, ideally with a physiotherapist.",
    "clinical.exercise.strength.steps": "1. Begin with resistance bands or 0.5–1 kg weights.\n2. 8–12 slow repetitions per exercise, one set.\n3. Rest 48h between strength sessions.\n4. Reduce weight if pain rises the next day.",
    "clinical.exercise.cycling.title": "Stationary Cycling",
    "clinical.exercise.cycling.details": "Weather-independent aerobic work with no impact — the seat carries your weight, not your joints.",
    "clinical.exercise.cycling.steps": "1. Set a comfortable seat height (slight knee bend).\n2. Start with 5 minutes, no resistance.\n3. Add 1–2 minutes per session, resistance last.\n4. Keep cadence slow and steady.",
    "clinical.exercise.seatedBand.title": "Seated Band Routine",
    "clinical.exercise.seatedBand.details": "A full upper-body session from a chair — for flare days, low-energy days, or office breaks.",
    "clinical.exercise.seatedBand.steps": "1. Sit tall with feet flat, band looped around both hands.\n2. Row: pull the band to your chest, elbows back.\n3. Press: extend both arms forward at chest height.\n4. 8–10 slow reps of each, rest as needed.",

    "clinical.sleep.title": "Sleep Hygiene Guidance",
    "clinical.sleep.subtitle": "Non-restorative sleep amplifies pain and fibro fog. These habits target the factors that matter most.",
    "clinical.sleep.checklistTitle": "Tonight's checklist",
    "clinical.sleep.score": "{count} of 8 habits",
    "clinical.sleep.reading.strong": "Strong routine",
    "clinical.sleep.reading.building": "Building up",
    "clinical.sleep.reading.starting": "Just starting",
    "clinical.sleep.hint.strong": "Keep it going — consistency is what protects your sleep.",
    "clinical.sleep.hint.building": "Pick one more habit and repeat it nightly for a week.",
    "clinical.sleep.hint.starting": "Start with a consistent wake time — it anchors everything else.",
    "clinical.sleep.disclaimer": "If insomnia persists despite good sleep habits, discuss it with your clinician — treatable conditions like restless legs or sleep apnea are common in fibromyalgia.",
    "clinical.sleep.consistentSchedule.title": "Consistent schedule",
    "clinical.sleep.consistentSchedule.body": "Same wake-up time every day — even after a bad night and on weekends.",
    "clinical.sleep.darkCoolRoom.title": "Dark, cool room",
    "clinical.sleep.darkCoolRoom.body": "Blackout the room and keep it slightly cool; night-time heat worsens fibro pain.",
    "clinical.sleep.screenWindDown.title": "Screen wind-down",
    "clinical.sleep.screenWindDown.body": "Park screens 60–90 minutes before bed; dim lights and switch to something calm.",
    "clinical.sleep.caffeineCutoff.title": "Caffeine cut-off",
    "clinical.sleep.caffeineCutoff.body": "No caffeine after early afternoon — it lingers 8+ hours and fragments deep sleep.",
    "clinical.sleep.eveningRoutine.title": "Evening routine",
    "clinical.sleep.eveningRoutine.body": "A fixed 20–30 minute wind-down — warm shower, light stretch, herbal tea — signals sleep to your body.",
    "clinical.sleep.preSleepRelaxation.title": "Relaxation in bed",
    "clinical.sleep.preSleepRelaxation.body": "Slow breathing or a body scan while lying down; if awake after ~20 minutes, get up and reset.",
    "clinical.sleep.gentleDaylight.title": "Morning daylight",
    "clinical.sleep.gentleDaylight.body": "10–20 minutes of outdoor light early in the day strengthens your sleep–wake rhythm.",
    "clinical.sleep.painComfortPrep.title": "Pain comfort prep",
    "clinical.sleep.painComfortPrep.body": "Set up support pillows, heat pad and comfort meds before bed so pain doesn't sabotage the night.",

    "clinical.coping.title": "Flare-up Management & Coping Toolkit",
    "clinical.coping.subtitle": "For flare moments: strategies you can start right now, plus a guided breathing exercise.",
    "clinical.coping.pacing.title": "Pacing & rest",
    "clinical.coping.pacing.body": "Down-shift activity instead of stopping completely; alternate 15–20 minutes of gentle effort with real rest.",
    "clinical.coping.pacing.action": "Try this: set a timer for 15 minutes of rest before your next task.",
    "clinical.coping.breathing.title": "Slow breathing",
    "clinical.coping.breathing.body": "Long, slow exhales calm the nervous system and take the edge off pain spikes.",
    "clinical.coping.breathing.action": "Try this: start the guided 4-7-8 exercise below.",
    "clinical.coping.grounding.title": "5-4-3-2-1 Grounding",
    "clinical.coping.grounding.body": "Anchor in the present when a flare brings panic: name 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste.",
    "clinical.coping.grounding.action": "Try this: go slowly — one sense at a time is enough.",
    "clinical.coping.heatComfort.title": "Gentle heat",
    "clinical.coping.heatComfort.body": "A warm pack, heated blanket or warm bath relaxes guarded muscles and eases deep aching.",
    "clinical.coping.heatComfort.action": "Try this: 15–20 minutes of warmth on the most painful area.",
    "clinical.coping.sensoryShutdown.title": "Sensory shutdown",
    "clinical.coping.sensoryShutdown.body": "During sensory overload, dim lights, silence notifications and retreat somewhere quiet for a few minutes.",
    "clinical.coping.sensoryShutdown.action": "Try this: headphones + dim room + slow breaths, 10 minutes.",
    "clinical.coping.support.title": "Reach out",
    "clinical.coping.support.body": "Tell one person how you feel — a partner, friend or the caregiver share link. Support lowers flare distress.",
    "clinical.coping.support.action": "Try this: send one short message — no explaining required.",
    "clinical.coping.breath.title": "Guided 4-7-8 breathing",
    "clinical.coping.breath.subtitle": "Inhale 4s · hold 7s · exhale 8s. Four cycles is a good first goal.",
    "clinical.coping.breath.start": "Start",
    "clinical.coping.breath.pause": "Pause",
    "clinical.coping.breath.reset": "Reset",
    "clinical.coping.breath.inhale": "Inhale",
    "clinical.coping.breath.hold": "Hold",
    "clinical.coping.breath.exhale": "Exhale",
    "clinical.coping.breath.cycleCount": "Cycles: {count}",
    "clinical.coping.breath.aria": "Guided breathing timer",
    "clinical.coping.disclaimer": "If a flare feels different from your usual pattern — new weakness, chest pain, one-sided symptoms — seek medical care promptly.",

    "clinical.report.title": "Weekly / Monthly Report",
    "clinical.report.subtitle": "A doctor-ready summary of your logs, triggers, labs and cycle context for the chosen period.",
    "clinical.report.period.week": "This week",
    "clinical.report.period.month": "This month",
    "clinical.report.stat.avgPain": "Average pain",
    "clinical.report.stat.peakPain": "Peak pain",
    "clinical.report.stat.flareDays": "Flare days (≥7/10)",
    "clinical.report.stat.adherence": "Logging adherence",
    "clinical.report.trigger.title": "Flare triggers in this period",
    "clinical.report.trigger.none": "No flare triggers logged in this period.",
    "clinical.report.trigger.top": "Top trigger: {factor} (avg {avg}/10 across {count} flares)",
    "clinical.report.lab.title": "Lab highlights",
    "clinical.report.lab.none": "No lab results in this period.",
    "clinical.report.meds.title": "Scheduled medications",
    "clinical.report.meds.none": "No scheduled medications configured.",
    "clinical.report.acr.title": "ACR 2010/2016 screening",
    "clinical.report.acr.met": "Criteria met (WPI {wpi}/19 · SS {ss}/12)",
    "clinical.report.acr.notMet": "Criteria not met (WPI {wpi}/19 · SS {ss}/12)",
    "clinical.report.acr.none": "No ACR assessment saved yet.",
    "clinical.report.cycle.title": "Cycle context",
    "clinical.report.cycle.none": "No cycle data in this period.",
    "clinical.report.empty": "No symptom logs in this period yet — keep logging to build the report.",
    "clinical.report.copy": "Copy for my doctor",
    "clinical.report.copied": "Copied ✓",
    "clinical.report.shareHint": "Paste into a message or print it for the appointment.",

    "caregiver.badge": "Caregiver view",
    "caregiver.title": "Flare forecast for {name}",
    "caregiver.readOnly": "Shared read-only — no diary or score data is shown here.",
    "caregiver.level.high": "Elevated",
    "caregiver.level.moderate": "Moderate",
    "caregiver.level.low": "Calm",
    "caregiver.daysToPeriod": "Days to next period",
    "caregiver.cyclePhase": "Cycle phase",
    "caregiver.unknown": "Unknown",
    "caregiver.insight": "Plan gentle support around the elevated window: keep rest cues close, meals warm and steady, and outings short. This link shares only today's forecast — it updates automatically.",
    "caregiver.linkInactive": "This share link is not active.",

    "doctor.filter.searchLabel": "Search the feed",
    "doctor.filter.searchPlaceholder": "Search title, body or author…",
    "doctor.filter.topic": "Topic",
    "doctor.filter.topicAll": "All topics",
    "doctor.filter.topics.pain": "Pain & flares",
    "doctor.filter.topics.sleep": "Sleep",
    "doctor.filter.topics.fatigue": "Fatigue & energy",
    "doctor.filter.topics.medication": "Medication",
    "doctor.filter.topics.nutrition": "Nutrition",
    "doctor.filter.topics.mentalHealth": "Mental health",
    "doctor.filter.topics.research": "Research",
    "doctor.filter.topics.lifestyle": "Lifestyle",
    "doctor.filter.specialization": "Specialization",
    "doctor.filter.specAll": "All specializations",
    "doctor.filter.spec.rheumatology": "Rheumatology",
    "doctor.filter.spec.neurology": "Neurology",
    "doctor.filter.spec.painMedicine": "Pain medicine",
    "doctor.filter.spec.physiatry": "Physical medicine",
    "doctor.filter.spec.physiotherapy": "Physiotherapy",
    "doctor.filter.spec.psychology": "Psychology",
    "doctor.filter.spec.generalMedicine": "General medicine",
    "doctor.filter.clear": "Clear filters",
    "doctor.filter.showing": "{shown} of {total} posts",
    "doctor.filter.noResults": "No posts match these filters. Try clearing them.",
  },
  ar: {
    "nav.dashboard": "اللوحة الرئيسية",
    "nav.healthLogs": "السجلات",
    "nav.resources": "الموارد",
    "nav.profile": "الملف الشخصي",
    "nav.toolkit": "حقيبة العناية",
    "nav.backToDashboard": "العودة للوحة التحكم",
    "nav.doctorHub": "قسم الأطباء",
    "nav.consultations": "الاستشارات",
    "nav.upgradePro": "ترقية Pro",
    "nav.language": "اللغة",
    "nav.switchToArabic": "التبديل إلى العربية",
    "nav.switchToEnglish": "التبديل إلى الإنجليزية",
    "nav.breadcrumb": "مسار التنقل",
    "nav.goBack": "رجوع",
    "nav.mainMenu": "القائمة",
    "nav.primaryNav": "التنقل الرئيسي",
    "consultationsHub.title": "الاستشارات وهيكلة الأعراض",
    "consultationsHub.subtitle": "نظم أعراضك بالذكاء الاصطناعي، راجع تقريرك السريري، وراسل فريق الرعاية بأمان.",
    "consultationsHub.viewAllThreads": "عرض كل المحادثات",
    "consultationsHub.intakeTitle": "هيكلة الأعراض بالذكاء الاصطناعي",
    "consultationsHub.intakeDescription": "اوصف شعورك بكلماتك الخاصة — وسيقوم الذكاء الاصطناعي بتنظيمها في ملخص واضح جاهز طبيًا.",
    "consultationsHub.persistOption": "حفظ هذا التسجيل أيضًا في سجلي الصحي",
    "consultationsHub.processing": "جارٍ الهيكلة…",
    "consultationsHub.structureAction": "هيكلة أعراضي",
    "consultationsHub.copy": "نسخ",
    "consultationsHub.intakeFailed": "تعذّرت هيكلة الأعراض. حاول مرة أخرى.",
    "consultationsHub.briefDescription": "تقريرك السريري التنفيذي لآخر 30 يومًا، جاهز لمشاركته مع طبيبك.",
    "consultationsHub.briefLoading": "جارٍ إعداد تقريرك…",
    "consultationsHub.briefEmpty": "لا يوجد تقرير سريري بعد — سجّل أعراضك لبضعة أيام لإنشاء واحد.",
    "consultationsHub.messagingTitle": "المراسلة الآمنة",
    "consultationsHub.messagingDescription": "محادثات محمية بصلاحيات صارمة مع أطبائك المعتمدين. أنت وطبيبك فقط من يمكنه قراءة هذه الرسائل.",
    "consultationsHub.loadingThreads": "جارٍ تحميل محادثاتك…",
    "consultationsHub.sendFailed": "تعذّر إرسال الرسالة. حاول مرة أخرى.",
    "consultationsHub.severitySlider": "الشدة من 10",
    "consultationsHub.reviewShareTitle": "راجع وشارك",
    "consultationsHub.logToRecordOption": "احفظ هذه الأعراض في سجلي الصحي",
    "consultationsHub.shareThreadLabel": "شارك الملخص مع طبيبك",
    "consultationsHub.shareThreadPlaceholder": "اختر محادثة…",
    "consultationsHub.submitAction": "حفظ ومشاركة",
    "consultationsHub.submitting": "جارٍ الإرسال…",
    "consultationsHub.submitFailed": "تعذّر الإرسال. حاول مرة أخرى.",
    "consultationsHub.loggedPart": "تم حفظ {count} عرض/أعراض في سجلك",
    "consultationsHub.sentPart": "تم إرسال الملخص إلى طبيبك",
    "header.themeLight": "التبديل إلى الوضع الفاتح",
    "header.themeDark": "التبديل إلى الوضع الداكن",
    "ai.statusLabel": "المساعد الذكي",
    "ai.checking": "جارٍ فحص حالة الذكاء الاصطناعي…",
    "ai.live": "مباشر",
    "ai.mock": "وضع المحاكاة",
    "ai.offline": "غير متصل",
    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "common.loading": "جاري التحميل...",
    "common.readMore": "اقرأ المزيد",
    "common.back": "رجوع",
    "common.signInRequired": "يجب تسجيل الدخول أولاً.",
    "auth.login.title": "مرحباً بك مجدداً",
    "auth.login.description": "سجل دخولك لمتابعة سجلاتك، وتوجهاتك، ودعمنا اللطيف.",
    "resources.title": "موارد الرعاية",
    "resources.subtitle": "استكشف الأدلة والنصائح والمحتوى التعليمي لمساعدتك على إدارة التهاب العضلات الليفية بثقة.",
    "resources.search": "البحث في الموارد...",
    "resources.all": "الكل",
    "resources.about": "عن التهاب العضلات الليفية",
    "resources.diagnosis": "التشخيص",
    "resources.treatment": "العلاج والرعاية الذاتية",
    "resources.nutrition": "التغذية",
    "resources.exercises": "التمارين",
    "resources.faq": "الأسئلة الشائعة",
    "resources.community": "المجتمع",
    "resources.filterAria": "تصفية الموارد حسب الفئة",
    "resources.category.all": "الكل",
    "resources.category.managingFlares": "إدارة النوبات",
    "resources.category.nutritionHydration": "التغذية والترطيب",
    "resources.category.gentleMovement": "حركة لطيفة",
    "resources.category.mentalSupport": "الدعم النفسي",
    "resources.tipsFor": "نصائح عملية لـ {category}.",
    "resources.card.flarePacing.title": "تقنيات تنظيم الجهد",
    "resources.card.flarePacing.description": "تعلّم كيف توازن بين النشاط والراحة لمنع الانتكاسات.",
    "resources.card.flarePacing.tip1": "قسّم المهام إلى أجزاء أصغر يمكن إدارتها.",
    "resources.card.flarePacing.tip2": "اضبط مؤقتًا للأنشطة وخذ استراحة قبل أن تشعر بالتعب.",
    "resources.card.flarePacing.tip3": "أعطِ الأولوية لأهم مهام اليوم.",
    "resources.card.flarePacing.tip4": "استمع إلى إشارات جسمك المبكرة.",
    "resources.card.flareHeat.title": "العلاج بالحرارة اللطيف",
    "resources.card.flareHeat.description": "استخدام الدفء لتخفيف تيبس المفاصل وإرخاء العضلات.",
    "resources.card.flareHeat.tip1": "استخدم كمادات دافئة أو وسادات تدفئة على المناطق المصابة.",
    "resources.card.flareHeat.tip2": "جرّب حمامات دافئة بأملاح إبسوم لتقليل توتر العضلات.",
    "resources.card.flareHeat.tip3": "تأكد ألا تكون مصادر الحرارة ساخنة جدًا لتجنب حروق الجلد.",
    "resources.card.flareHeat.tip4": "طبّق الدفء لمدة 15-20 دقيقة في المرة الواحدة.",
    "resources.card.antiInflammatory.title": "نظام غذائي مضاد للالتهابات",
    "resources.card.antiInflammatory.description": "أطعمة قد تساعد في تقليل الالتهاب وآلام المفاصل.",
    "resources.card.antiInflammatory.tip1": "أدرج أطعمة غنية بأوميغا 3 مثل السلمون والجوز وبذور الكتان.",
    "resources.card.antiInflammatory.tip2": "تناول الكثير من التوت الملون والخضروات الورقية.",
    "resources.card.antiInflammatory.tip3": "قلل السكريات المصنعة والكربوهيدرات المكررة.",
    "resources.card.antiInflammatory.tip4": "جرّب الكركم والزنجبيل لخصائصهما الطبيعية المضادة للالتهاب.",
    "resources.card.hydration.title": "استراتيجيات الترطيب",
    "resources.card.hydration.description": "نصائح للبقاء رطبًا حتى عندما يبدو شرب الماء كواجب شاق.",
    "resources.card.hydration.tip1": "احمل زجاجة ماء قابلة لإعادة الاستخدام معك دائمًا.",
    "resources.card.hydration.tip2": "جرّب ماء منكّهًا بالخيار أو الليمون لمزيد من النكهة.",
    "resources.card.hydration.tip3": "اضبط تذكيرات لشرب الماء طوال اليوم.",
    "resources.card.hydration.tip4": "تناول أطعمة غنية بالماء مثل البطيخ والخيار.",
    "resources.card.stretching.title": "تمطيط لطيف",
    "resources.card.stretching.description": "طرق منخفضة التأثير للحفاظ على المرونة دون إجهاد.",
    "resources.card.stretching.tip1": "ركّز على حركات بطيئة ومنتظمة.",
    "resources.card.stretching.tip2": "لا تتجاوز الألم الحاد أبدًا؛ تمدد فقط حتى شد خفيف.",
    "resources.card.stretching.tip3": "استخدم كرسيًا أو حائطًا للدعم أثناء التمدد.",
    "resources.card.stretching.tip4": "حافظ على التمدد 15-30 ثانية وتنفس بعمق.",
    "resources.card.walking.title": "المشي منخفض التأثير",
    "resources.card.walking.description": "طرق لإدراج المشي في روتينك بأمان.",
    "resources.card.walking.tip1": "ابدأ بمسافات قصيرة جدًا وزدها تدريجيًا.",
    "resources.card.walking.tip2": "امشِ على أسطح مستوية وثابتة لتجنب السقوط.",
    "resources.card.walking.tip3": "ارتدِ أحذية داعمة ومريحة.",
    "resources.card.walking.tip4": "خذ فترات راحة متكررة وامشِ بوتيرة تسمح لك بالتحدث براحة.",
    "resources.card.mindfulness.title": "ممارسات اليقظة الذهنية",
    "resources.card.mindfulness.description": "تهدئة العقل لإدارة الأثر العاطفي للألم بشكل أفضل.",
    "resources.card.mindfulness.tip1": "مارس التنفس البطني العميق 5 دقائق يوميًا.",
    "resources.card.mindfulness.tip2": "جرّب تطبيق تأمل موجه للاسترخاء.",
    "resources.card.mindfulness.tip3": "ركّز كل صباح على أشياء قليلة تشعر بالامتنان تجاهها.",
    "resources.card.mindfulness.tip4": "استخدم تقنيات التمركز: حدد 5 أشياء تراها و4 تلمسها، وهكذا.",
    "resources.card.sleepHygiene.title": "نظافة النوم",
    "resources.card.sleepHygiene.description": "بناء روتين لنوم أعمق وأكثر إفادة.",
    "resources.card.sleepHygiene.tip1": "حافظ على جدول نوم واستيقاظ منتظم.",
    "resources.card.sleepHygiene.tip2": "تجنب الشاشات قبل النوم بساعة على الأقل.",
    "resources.card.sleepHygiene.tip3": "أنشئ طقسًا مهدئًا قبل النوم (مثل شاي الأعشاب أو قراءة خفيفة).",
    "resources.card.sleepHygiene.tip4": "أبقِ غرفة نومك باردة ومظلمة وهادئة.",
    "resources.card.breathwork.title": "تمارين التنفس للنوبات",
    "resources.card.breathwork.description": "تقنيات تنفس بطيئة لتهدئة الجهاز العصبي أثناء النوبة.",
    "resources.card.breathwork.tip1": "جرّب نمط 4-7-8: شهيق 4 ثوانٍ، حبس 7، زفير 8.",
    "resources.card.breathwork.tip2": "اجلس براحة ونفّس بعمق في بطنك.",
    "resources.card.breathwork.tip3": "ابدأ بدقيقتين؛ وزِد إذا شعرت بالراحة.",
    "resources.card.audioTherapy.title": "العلاج الصوتي",
    "resources.card.audioTherapy.description": "أصوات مهدئة ونغمات ثنائية لأيام الألم.",
    "resources.card.audioTherapy.tip1": "استخدم الضجيج البني أو الموسيقى الهادئة لتخفيف انزعاج النوبة.",
    "resources.card.audioTherapy.tip2": "النغمات الثنائية تعمل بشكل أفضل مع سماعات الرأس.",
    "resources.card.audioTherapy.tip3": "اجمع العلاج الصوتي مع تنظيم الجهد أو الحرارة لأفضل نتيجة.",
    "resources.card.flarePacing.summary.1": "قسّم المهام إلى خطوات صغيرة.",
    "resources.card.flarePacing.summary.2": "استرح قبل أن تشعر بالتعب — اضبط مؤقتًا.",
    "resources.card.flarePacing.summary.3": "أبقِ النشاط ثابتًا؛ تجنّب أيام الذروة والانهيار.",
    "resources.card.flareHeat.summary.1": "طبّق حرارة رطبة لمدة 15–20 دقيقة.",
    "resources.card.flareHeat.summary.2": "حمام دافئ أو دش يرخي العضلات المشدودة.",
    "resources.card.flareHeat.summary.3": "أبقِ الحرارة دافئة، لا ساخنة لدرجة الحرق.",
    "resources.card.antiInflammatory.summary.1": "أضف أطعمة أوميغا 3: السلمون والجوز وبذور الكتان.",
    "resources.card.antiInflammatory.summary.2": "املأ نصف طبقك بالخضار والفواكه.",
    "resources.card.antiInflammatory.summary.3": "قلل السكر المصنّع، لا الأطعمة الكاملة.",
    "resources.card.hydration.summary.1": "أبقِ زجاجة ماء في متناول يدك.",
    "resources.card.hydration.summary.2": "اضبط 2–3 تذكيرات لطيفة لشرب الماء يوميًا.",
    "resources.card.hydration.summary.3": "تناول أطعمة غنية بالماء أيضًا: البطيخ والخيار.",
    "resources.card.stretching.summary.1": "تحرّك ببطء؛ توقف عند الشد الخفيف.",
    "resources.card.stretching.summary.2": "اثبت 15–30 ثانية وتنفس خلالها.",
    "resources.card.stretching.summary.3": "استخدم كرسيًا أو حائطًا للدعم.",
    "resources.card.walking.summary.1": "ابدأ بـ5–10 دقائق على أرض مستوية.",
    "resources.card.walking.summary.2": "زد الوقت ببطء، لا المسافة أولًا.",
    "resources.card.walking.summary.3": "امشِ بوتيرة تسمح لك بالتحدث.",
    "resources.card.mindfulness.summary.1": "تنفّس بعمق وببطء لمدة دقيقتين.",
    "resources.card.mindfulness.summary.2": "سمِّ 5 أشياء تراها و4 تلمسها.",
    "resources.card.mindfulness.summary.3": "شيء صغير واحد للامتنان كل صباح.",
    "resources.card.sleepHygiene.summary.1": "نفس وقت الاستيقاظ يوميًا حتى في العطلات.",
    "resources.card.sleepHygiene.summary.2": "لا شاشات قبل النوم بساعة.",
    "resources.card.sleepHygiene.summary.3": "أبقِ الغرفة باردة ومظلمة وهادئة.",
    "resources.card.breathwork.summary.1": "جرّب 4-7-8: شهيق 4 ثوانٍ، حبس 7، زفير 8.",
    "resources.card.breathwork.summary.2": "دقيقتان تكفيان للبدء.",
    "resources.card.breathwork.summary.3": "نفّس بعمق في البطن لا الصدر.",
    "resources.card.audioTherapy.summary.1": "الموسيقى الهادئة أو الضجيج البني يخفف التوتر.",
    "resources.card.audioTherapy.summary.2": "استخدم سماعات الرأس للنغمات الثنائية.",
    "resources.card.audioTherapy.summary.3": "شغّلها أثناء النوبات أو قبل الاسترخاء.",
    "resources.ai.summaryTitle": "ملخص ذكي سريع",
    "resources.ai.toggle": "ملخص ذكي سريع (خلاصة)",
    "resources.ai.hide": "إخفاء الملخص",
    "resources.ai.verified": "مصدر موثوق",
    "resources.ai.guidelineLabel": "الإرشاد المُستشهد به",
    "resources.ai.titleLabel": "العنوان الطبي",
    "resources.ai.originLabel": "الأصل السريري",
    "resources.ai.summaryLabel": "الملخص السريري",
    "resources.ai.viewGuideline": "عرض الإرشاد المُستشهد به",
    "resources.ai.unverified": "تعذّر التحقق من هذا في فهرس المعرفة",
    "resources.ai.unverifiedNote": "إرشاد آمن دون اتصال بدلًا من ذلك: خفّف المتطلبات، واسترح، وحافظ على الترطيب. تواصل مع فريقك الطبي إذا كانت الأعراض شديدة أو غير معتادة.",
    "resources.ai.foggy": "اشرح لي كأني في ضباب",
    "resources.ai.standard": "لغة عادية",
    "resources.plan.title": "خطة مواجهة النوبة الذكية",
    "resources.plan.subtitle": "بروتوكول إغاثة فوري من 3 خطوات مبني على ألمك وطاقتك والطقس.",
    "resources.plan.create": "إنشاء خطة مواجهة",
    "resources.plan.rebuild": "إعادة بناء الخطة",
    "resources.plan.step": "الخطوة {n}",
    "resources.plan.basedOn": "مبنية على: {context}",
    "resources.plan.step.rest.title": "استرح بهدوء وببطء",
    "resources.plan.step.rest.detail": "استلقِ في غرفة مظلمة هادئة لمدة 10–20 دقيقة. خفّف المتطلبات بدلًا من المضي قدمًا.",
    "resources.plan.step.heat.title": "طبّق حرارة لطيفة",
    "resources.plan.step.heat.detail": "كمادة دافئة على المناطق المشدودة، أو حمام دافئ، لمدة 15–20 دقيقة. دافئة، لا ساخنة لدرجة الحرق.",
    "resources.plan.step.breathe.title": "أبطئ تنفسك",
    "resources.plan.step.breathe.detail": "دقيقتان من التنفس البطني البطيء (4-7-8) لتخفيف استجابة التوتر التي تضخّم الألم.",
    "resources.plan.step.pace.title": "نظّم جهد بقية اليوم",
    "resources.plan.step.pace.detail": "أجّل المهام غير الأساسية، واقسم الباقي إلى خطوات صغيرة، وأبقِ النشاط ثابتًا لتجنب الانهيار.",
    "resources.plan.step.environment.title": "خفّف المنبهات",
    "resources.plan.step.environment.detail": "خفّف الأضواء، وقلّل الضوضاء، وحدّد الشاشات، وأبقِ مساحة منخفضة التحفيز للساعة القادمة.",
    "resources.plan.step.hydrate.title": "حافظ على الترطيب",
    "resources.plan.step.hydrate.detail": "أبقِ الماء في متناول يدك واشرب ببطء؛ الجفاف يزيد الإرهاق والضباب.",
    "resources.plan.step.resume.title": "استأنف تدريجيًا",
    "resources.plan.step.resume.detail": "عد إلى النشاط الطبيعي ببطء بعد هدوء النوبة، لتجنب دورة الانهيار والارتداد.",
    "resources.plan.step.care.title": "راقب وتواصل",
    "resources.plan.step.care.detail": "إذا كان الألم شديدًا أو طويلًا بشكل غير عادي، أو صاحبه حمى أو تنميل أو ألم في الصدر، تواصل مع فريقك الطبي.",
    "resources.bodyMap.title": "خريطة أعراض الجسم",
    "resources.bodyMap.subtitle": "المس منطقة من الجسم لتصفية الموارد وإيجاد علاجات موضعية.",
    "resources.bodyMap.part.neck": "الرقبة",
    "resources.bodyMap.part.shoulders": "الكتفان",
    "resources.bodyMap.part.lowerBack": "أسفل الظهر",
    "resources.bodyMap.part.hips": "الوركان",
    "resources.bodyMap.part.knees": "الركبتان",
    "resources.bodyMap.part.joints": "المفاصل",
    "resources.bodyMap.clear": "مسح الاختيار",
    "resources.bodyMap.heatHint": "قد يساعد العلاج بالحرارة هنا",
    "resources.bodyMap.movementHint": "قد تساعد الحركة اللطيفة هنا",
    "resources.bodyMap.rotateHint": "اسحب أو أمِل للاستكشاف ثلاثي الأبعاد",
    "resources.bodyMap.tapHint": "اضغط على عقدة متوهجة لتسجيل الألم فيها",
    "resources.semantic.matched": "مطابق: {category}",
    "resources.semantic.clear": "مسح البحث",
    "resources.effort.low": "جهد منخفض",
    "resources.effort.medium": "جهد متوسط",
    "resources.painAware.banner": "ألم مرتفع اليوم — نعرض الخيارات الألطف أولًا",
    "resources.painAware.highPain": "ألم مرتفع",
    "resources.empty": "لا توجد موارد مطابقة لبحثك. جرّب مصطلحًا آخر أو امسح عوامل التصفية.",
    "resources.feed.title": "خلاصة رعاية مخصصة",
    "resources.feed.subtitle": "مجموعة لطيفة ومتجددة تتشكل حسب الألم والطاقة والطقس.",
    "resources.feed.refresh": "تحديث الخلاصة",
    "resources.feed.refreshing": "جارٍ التحديث...",
    "resources.feed.live": "مرتبة بالذكاء الاصطناعي من موارد رعاية منتقاة",
    "resources.feed.offline": "مخصصة محليًا من موارد رعاية منتقاة",
    "about.title": "عن التهاب العضلات الليفية",
    "about.subtitle": "فهم حالتك هو الخطوة الأولى نحو إدارة أفضل.",
    "about.overview": "ما هو التهاب العضلات الليفية؟",
    "about.causes": "السبب المحتمل",
    "about.symptoms": "الأعراض الشائعة",
    "about.causesDetail": "السبب الدقيق لالتهاب العضلات الليفية غير مفهوم تمامًا، لكن الباحثين يعتقدون أنه يتضمن عوامل وراثية وبيئية ونفسية. النظريات الرئيسية تشمل:\n\nمعالجة غير طبيعية للألم: الجهاز العصبي المركزي يضخم إشارات الألم، مما يجعلك أكثر حساسية للمنبهات.\n\nالعوامل الوراثية: التهاب العضلات الليفية يميل إلى التواجد في العائلات، مما يشير إلى أن بعض الطفرات الجينية قد تزيد من القابلية.\n\nالصدمات الجسدية أو العاطفية: اضطراب ما بعد الصدمة أو الجراحة أو الاضطراب العاطفي الكبير يمكن أن يُطلق الحالة.\n\nاضطرابات النوم: اضطرابات النوم المزمنة مثل متلازمة الساقين غير الهادئة أو انقطاع النفس أثناء النوم مرتبطة بشكل شائع.\n\nالعدوى: بعض الأمراض تظهر لتشغيل أو تفاقم أعراض التهاب العضلات الليفية.",
    "about.symptomsDetail": "العلامة المميزة لالتهاب العضلات الليفية هي الألم العضلي الهيكلي الواسع، لكن الحالة تؤثر على العديد من أعضاء الجسم:\n\nالألم الواسع: ألم مستمر خافت يستمر ثلاثة أشهر على الأقل، يحدث على جانبي الجسم وفوق وتحن الخصر.\n\nالإرهاق: حتى بعد النوم لفترات طويلة، يستيقظ مرضى التهاب العضلات الليفية متعبين. النوم متقطع بشكل متكرر بسبب الألم.\n\nصعوبات إدراكية (ضباب الألياف): مشاكل في التركيز والانتباه والذاكرة شائعة.\n\nمشاكل النوم: العديد من المرضى يعانون من الأرق أو النوم غير المتجدد.\n\nالصداع والشقيقة: صداع التوتر المتكرر أو الشقيقة.\n\nالتيبس: خاصة عند الاستيقاظ في الصباح.\n\nالحساسية: حساسية مفرطة للضوء والضوضاء ودرجة الحرارة والروائح.\n\nمشاكل الجهاز الهضمي: متلازمة القولون العصبي تحدث بشكل متكرر.",
    "about.overviewContent": "التهاب العضلات الليفية (Fibromyalgia) هو حالة مزمنة تسبب ألمًا واسع النطاق في العضلات والعظام، إلى جانب الإرهاق واضطرابات النوم ومشاكل إدراكية وأعراض أخرى. لا يوجد علاج معروف، لكن يمكن إدارة الأعراض بشكل فعال.",
    "about.overviewPlain": "التهاب العضلات الليفية حالة طويلة الأمد يشعر فيها جسمك بالألم بسهولة أكبر من الطبيعي. ويصاحبه تعب شديد ونوم سيئ وصعوبة في التركيز. لا يوجد علاج شافٍ، لكن الروتين المناسب يمكن أن يساعد كثيرًا.",
    "about.causesPlain": "لا يعرف الأطباء السبب الدقيق لالتهاب العضلات الليفية. يبدو أنه ينتشر في العائلات، وقد تُشعله أمور مثل التوتر أو الإصابة أو المرض. قد يرفع دماغك ببساطة مستوى إشارات الألم — إنها حالة حقيقية وليست خيالية.",
    "about.symptomsPlain": "العلامة الرئيسية هي ألم في جميع أنحاء الجسم يستمر لأشهر. قد تستيقظ أيضًا متعبًا، وتجد صعوبة في التركيز، وتنام بشكل سيئ، وتشعر بتيبس. كلها أعراض حقيقية للحالة وليست كسلًا.",
    "about.highlight.prevalence.label": "الانتشار",
    "about.highlight.prevalence.value": "2-4% من السكان",
    "about.highlight.pain.label": "الألم",
    "about.highlight.pain.value": "مزمن وواسع النطاق",
    "about.highlight.management.label": "الإدارة",
    "about.highlight.management.value": "يمكن إدارته بفعالية",
    "about.symptom.pain.label": "الألم الواسع",
    "about.symptom.pain.value": "ألم خافت في الجانبين، 3 أشهر أو أكثر",
    "about.symptom.fatigue.label": "الإرهاق",
    "about.symptom.fatigue.value": "الاستيقاظ متعبًا حتى بعد نوم طويل",
    "about.symptom.fog.label": "ضباب الألياف",
    "about.symptom.fog.value": "صعوبة في التركيز والانتباه والذاكرة",
    "about.symptom.sleep.label": "مشاكل النوم",
    "about.symptom.sleep.value": "الأرق أو النوم غير المجدد",
    "about.symptom.headache.label": "الصداع والصداع النصفي",
    "about.symptom.headache.value": "صداع توتر متكرر أو نوبات صداع نصفي",
    "about.symptom.sensitivity.label": "حساسية مفرطة",
    "about.symptom.sensitivity.value": "الإضاءة والضوضاء والحرارة والروائح تبدو قوية جدًا",
    "about.symptom.stiffness.label": "التيبس",
    "about.symptom.stiffness.value": "تيبس وألم خاصة عند الاستيقاظ في الصباح",
    "about.symptom.digestive.label": "مشاكل الجهاز الهضمي",
    "about.symptom.digestive.value": "متلازمة القولون العصبي تحدث بشكل متكرر",
    "about.cause.amplified.title": "التحسس المركزي",
    "about.cause.amplified.desc": "يرفع الدماغ والحبل الشوكي من صوت إشارات الألم، فيتم الشعور بالضغط الخفيف أو الحرارة المعتدلة كألم حقيقي.",
    "about.cause.genetic.title": "استعداد وراثي",
    "about.cause.genetic.desc": "تنتشر الحالة في العائلات غالبًا، مما يشير إلى فروق موروثة في كيفية تعامل الجهاز العصبي مع الألم.",
    "about.cause.trauma.title": "صدمة جسدية أو عاطفية",
    "about.cause.trauma.desc": "يمكن للجراحة أو الإصابة أو العدوى أو الضغط المطوّل أن يكون محفزًا ينقل الجهاز العصبي إلى حالة التحسس.",
    "about.cause.sleep.title": "اضطرابات النوم",
    "about.cause.sleep.desc": "حالات مثل متلازمة تململ الساقين أو انقطاع التنفس أثناء النوم تعكر النوم العميق وقد تطلق الأعراض أو تزيدها.",
    "about.cause.infection.title": "العدوى",
    "about.cause.infection.desc": "بعض الأمراض الفيروسية أو البكتيرية يبدو أنها تُشعل الحالة أو تزيد من شدة الأعراض الموجودة.",
    "about.causesIntro": "السبب الدقيق غير مفهوم تمامًا — يصفه أغلب الباحثين بأنه مزيج من هذه العوامل.",
    "about.symptomsIntro": "تؤثر الفيبروميالجيا على أجهزة الجسم المختلفة. هذه أبرز الأعراض التي يصفها المرضى.",
    "about.gutBrain.title": "الصلة بين الأمعاء والدماغ",
    "about.gutBrain.intro": "ما يصل إلى 70٪ من مرضى الفيبروميالجيا يعانون أيضًا من القولون العصبي. إليك السبب.",
    "about.gutBrain.detail": "تتواصل الأمعاء والدماغ باستمرار عبر العصب الحائر والإشارات المناعية والميكروبيوم. عندما ترفع الفيبروميالجيا صوت الألم والتوتر، تشعر الأمعاء بذلك أيضًا — مما يؤدي إلى الانتفاخ والألم واضطراب الحركة. دعم أحدهما غالبًا ما يدعم الآخر.",
    "about.gut.node.brain": "الجهاز العصبي المركزي",
    "about.gut.node.brainHint": "معالجة الألم والتوتر",
    "about.gut.node.vagus": "العصب الحائر",
    "about.gut.node.vagusHint": "طريق معلومات ثنائي الاتجاه",
    "about.gut.node.gut": "الأمعاء والميكروبيوم",
    "about.gut.node.gutHint": "إشارات مناعية وسيروتونين",
    "about.gut.node.symptoms": "أعراض القولون العصبي",
    "about.gut.node.symptomsHint": "انتفاخ، ألم، اضطراب الإخراج",
    "about.gut.tip.bloating": "انتفاخ وتطبل",
    "about.gut.tip.motility": "اضطراب حركة الأمعاء",
    "about.gut.tip.stress": "نوبات مرتبطة بالتوتر",
    "about.gut.tip.microbiome": "توازن الميكروبيوم",
    "about.weatherSensitivity.title": "حساسية الطقس وتغيرات الحرارة",
    "about.weatherSensitivity.eyebrow": "العوامل البيئية والمحفزات",
    "about.weatherSensitivity.intro": "يُعدّ الطقس من أكثر المحفِّزات البيئية شيوعًا لنوبات الفيبروميالجيا. ففي الصيف، يزيد الحرّ الشديد من شدة إشارات الألم والإرهاق؛ وفي الشتاء، يزيد البرد والرطوبة من تيبُّس العضلات وثقلها وبطء حركتها. أما التقلبات السريعة والمفاجئة في درجات الحرارة والضغط الجوي — التي ترافق العواصف أو تغيُّر الفصول — فتجعل الجهاز العصبي المتحسِّس يشعر وكأنه مهدَّد، فتتعاظم شدّة الألم والتيبُّس والإرهاق خلال ساعات.",
    "about.weatherSensitivity.tip.heat": "حرّ الصيف: حافظ على البرودة والترطيب",
    "about.weatherSensitivity.tip.cold": "برد الشتاء: ارتدِ طبقاتٍ ودفّئ عضلاتك",
    "about.weatherSensitivity.tip.pressure": "تقلب الضغط: تابع نشرة الطقس ونظّم يومك",
    "about.weatherSensitivity.tip.transition": "التغيُّر المفاجئ: انتقل ببطء بين الداخل والخارج",
    "about.visual.eyebrow": "فهم الحالة",
    "about.visual.symptoms.caption": "خريطة الجسم — المناطق الأكثر تأثرًا بالفيبروميالجيا",
    "about.visual.gutBrain.eyebrow": "لماذا القولون العصبي شائع",
    "diagnosis.title": "التشخيص",
    "diagnosis.subtitle": "تعرف على كيفية تشخيص التهاب العضلات الليفية وما يمكن توقعه أثناء العملية.",
    "diagnosis.howDiagnosed": "كيف يتم تشخيص التهاب العضلات الليفية؟",
    "diagnosis.tests": "الاختبارات والتقييمات",
    "diagnosis.specialist": "متى ترى أخصائي",
    "diagnosis.criteria": "يتم تشخيص التهاب العضلات الليفية بناءً على الأعراض واستبعاد الحالات الأخرى. معايير الكلية الأمريكية للروماتيزم تشمل:\n\nمؤشر الألم الواسع (WPI) ومقياس شدة الأعراض (SSS)\nالأعراض موجودة لمدة ثلاثة أشهر على الأقل\nلا توجد حالة أخرى تفسر الألم\n\nالأطباء قد يستخدمون أيضًا اختبار نقاط الحساسية، حيث يتم الضغط على مناطق محددة من الجسم لتقييم الحساسية.",
    "diagnosis.exams": "على الرغم من عدم وجود اختبار حاسم واحد لالتهاب العضلات الليفية، قد يطلب طبيبك اختبارات لاستبعاد الحالات الأخرى:\n\nصورة الدم الكاملة (CBC): تتحقق من علامات العدوى أو فقر الدم\nمعدل ترسب الكريات الحمراء (ESR): يقيس مستويات الالتهاب\nاختبارات وظيفة الغدة الدرقية: تستبعد اضطرابات الغدة الدرقية\nمستويات فيتامين D: النقص يمكن أن يحاكي أعراض التهاب العضلات الليفية\nعامل الروماتويد: يستبعد التهاب المفاصل الروماتويدي\nدراسات النوم: تحدد اضطرابات النوم التي قد تساهم في الأعراض\n\nهذه الاختبارات تساعد في التأكد من أن أعراضك ليست بسبب حالة أخرى قابلة للعلاج.",
    "diagnosis.criteriaPlain": "يشخّص الأطباء التهاب العضلات الليفية بشكل أساسي بالاستماع إلى أعراضك واستبعاد الحالات الأخرى. ينظرون إلى درجتين: مؤشر الألم الواسع (WPI) — عدد مناطق الجسم المؤلمة — ومقياس شدة الأعراض (SSS) — مدى قوة مشاكل التعب والنوم والتفكير لديك. يجب أن تستمر الأعراض 3 أشهر على الأقل، وألا تفسرها حالة أخرى.",
    "diagnosis.examsPlain": "لا يوجد فحص دم واحد يؤكد التهاب العضلات الليفية. يطلب الطبيب الفحوصات أساسًا لاستبعاد حالات أخرى قد تفسر أعراضك: صورة الدم الكاملة (CBC) لفقر الدم أو العدوى، وESR للالتهاب، وفحوصات الغدة الدرقية، ومستوى فيتامين D، وفحص عامل الروماتويد. وقد تُضاف دراسة نوم إذا اشتبه في مشاكل النوم.",
    "diagnosis.specialistDetail": "إذا كنت تعاني من ألم وإرهاق واسع النطاق لمدة ثلاثة أشهر أو أكثر، وكانت الأعراض تؤثر على حياتك اليومية، فمن المفيد أن تطلب من طبيب الرعاية الأولية إحالتك إلى أخصائي الروماتيزم. يمكن للأخصائي مراجعة أعراضك وطلب الفحوصات المناسبة وتأكيد أو استبعاد التهاب العضلات الليفية.",
    "diagnosis.specialistPlain": "إذا استمر الألم والتعب 3 أشهر أو أكثر وأصبحا يعيقان حياتك اليومية، فاسأل طبيبك المعتاد عن مراجعة أخصائي الروماتيزم — متخصص يمكنه فحص أعراضك وطلب الفحوصات الصحيحة وإعطائك إجابة واضحة.",
    "diagnosis.criteria.wpi.label": "WPI",
    "diagnosis.criteria.wpi.value": "مؤشر الألم الواسع — ألم في 7 من 19 منطقة على الأقل",
    "diagnosis.criteria.sss.label": "SSS",
    "diagnosis.criteria.sss.value": "مقياس شدة الأعراض — التعب والنوم والإدراك",
    "diagnosis.criteria.duration.label": "المدة",
    "diagnosis.criteria.duration.value": "الأعراض مستمرة لمدة 3 أشهر على الأقل",
    "diagnosis.criteria.exclusion.label": "الاستبعاد",
    "diagnosis.criteria.exclusion.value": "لا توجد حالة أخرى تفسر الألم",
    "diagnosis.exam.cbc.label": "CBC",
    "diagnosis.exam.cbc.value": "صورة الدم الكاملة — العدوى أو فقر الدم",
    "diagnosis.exam.esr.label": "ESR",
    "diagnosis.exam.esr.value": "معدل ترسب الكريات الحمراء — الالتهاب",
    "diagnosis.exam.thyroid.label": "الغدة الدرقية",
    "diagnosis.exam.thyroid.value": "اختبارات وظائف الغدة الدرقية — اضطراباتها",
    "diagnosis.exam.vitaminD.label": "فيتامين D",
    "diagnosis.exam.vitaminD.value": "نقصه قد يحاكي أعراض التهاب العضلات الليفية",
    "diagnosis.exam.rheumatoid.label": "عامل الروماتويد",
    "diagnosis.exam.rheumatoid.value": "يستبعد التهاب المفاصل الروماتويدي",
    "diagnosis.exam.sleep.label": "دراسات النوم",
    "diagnosis.exam.sleep.value": "تحديد اضطرابات النوم المساهمة",
    "diagnosis.specialistHighlight.1": "استشر طبيب الروماتيزم إذا استمرت الأعراض",
    "diagnosis.specialistHighlight.2": "احتفظ بسجل للأعراض",
    "diagnosis.specialistHighlight.3": "اطلب تقييمًا من متخصص",
    "resources.takeaway.title": "خلاصة ذكية في دقيقة",
    "resources.takeaway.subtitle": "الأساسيات في 3 نقاط قصيرة",
    "resources.takeaway.open": "عرض الخلاصة",
    "resources.takeaway.close": "إخفاء الخلاصة",
    "resources.takeaway.about.1": "التهاب العضلات الليفية حالة مزمنة حقيقية — الجهاز العصبي يضخم إشارات الألم.",
    "resources.takeaway.about.2": "يجمع بين الألم الواسع والإرهاق وضعف النوم والضباب الإدراكي.",
    "resources.takeaway.about.3": "لا يوجد علاج شافٍ، لكن يمكن إدارة الأعراض جيدًا بالخطة المناسبة.",
    "resources.takeaway.diagnosis.1": "التشخيص سريري: تقييم WPI + SSS، وأعراض لمدة 3 أشهر فأكثر، ولا تفسير آخر.",
    "resources.takeaway.diagnosis.2": "لا يؤكده فحص دم — تُستخدم المختبرات لاستبعاد حالات أخرى أولًا.",
    "resources.takeaway.diagnosis.3": "يمكن لأخصائي الروماتيزم تقييم أعراضك وتأكيد أو استبعاد التهاب العضلات الليفية.",
    "resources.takeaway.treatment.1": "تبدأ الرعاية بأساليب غير دوائية: تثقيف المريض والتمارين المتدرجة والعلاج السلوكي المعرفي.",
    "resources.takeaway.treatment.2": "الأدوية تساعد بعض الناس — الخيارات فردية ويجب أن يوجهها فريق الرعاية الخاص بك.",
    "resources.takeaway.treatment.3": "الهدف هو تحسين الوظيفة وجودة الحياة، وليس القضاء على الألم تمامًا.",
    "resources.takeaway.nutrition.1": "النظام الغذائي المتوسطي المضاد للالتهاب داعم — وليس علاجًا شافيًا.",
    "resources.takeaway.nutrition.2": "ركّز على الخضروات والفواكه والحبوب الكاملة والأسماك الغنية بأوميغا 3، وقلّل الأطعمة المصنعة والسكر.",
    "resources.takeaway.nutrition.3": "حافظ على الترطيب — فالجفاف قد يزيد الإرهاق وضباب الدماغ سوءًا.",
    "resources.takeaway.exercises.1": "التمارين الهوائية المتدرجة وتقوية العضلات هي الأكثر إثباتًا بين الخيارات غير الدوائية.",
    "resources.takeaway.exercises.2": "ابدأ بأقل بكثير من طاقتك وزِد ببطء شديد — دقائق معدودة من المشي أو جلسات الماء الدافئ.",
    "resources.takeaway.exercises.3": "الخيارات منخفضة التأثير مثل المشي والسباحة والتاي تشي واليوجا عادةً ما تكون الأفضل تحملًا.",
    "resources.takeaway.faq.1": "التهاب العضلات الليفية حالة مزمنة، لكن يمكن إدارة الأعراض جيدًا بالخطة المناسبة.",
    "resources.takeaway.faq.2": "لا يوجد علاج معروف — تجمع الرعاية بين الأدوية والعلاج والتمارين وإدارة التوتر ونمط الحياة.",
    "resources.takeaway.faq.3": "قد يستغرق التشخيص وقتًا؛ يساعد سجل الأعراض وإحالة أخصائي الروماتيزم.",
    "resources.takeaway.community.1": "مشاركة التجارب مع أشخاص يفهمونك تقلل الشعور بالعزلة.",
    "resources.takeaway.community.2": "نصائح الأقران (الدفء، الإيقاع المتدرج، الحركة اللطيفة) تكمل الإرشادات السريرية.",
    "resources.takeaway.community.3": "اليقظة الذهنية وتقليل التوتر جزء من الأدوات المثبتة علميًا.",
    "resources.takeaway.cycle.1": "انخفاض الهرمونات قبل الدورة قد يزيد حساسية الألم وضباب الدماغ في الفيبروميالجيا.",
    "resources.takeaway.cycle.2": "تتضخم الأعراض غالبًا في نافذة قبل الدورة بـ 3–7 أيام — خففي جدولك وقتها.",
    "resources.takeaway.cycle.3": "تتبع الدورة مع الأعراض معًا يحوّل هذا الإيقاع إلى إنذار مبكر يمكن التخطيط حوله.",
    "resources.cycle": "الفيبروميالجي والدورة الشهرية",
    "cycle.title": "الفيبروميالجي والدورة الشهرية: الآلية، التنبؤ بالآلام، وطرق التعامل",
    "cycle.subtitle": "لماذا تشتد الأعراض قبل الدورة — وكيف يساعدك توقع هذا النمط على البقاء متقدمًا عليه.",
    "cycle.eyebrow": "الهرمونات وحساسية الألم",
    "cycle.intro": "تشعر كثيراتهن من المصابات بالفيبروميالجيا بتضخم الأعراض في الأيام السابقة للحيض. هذا ليس مصادفة: تقلبات الهرمونات التناسلية تتفاعل مع نفس تضخيم إشارات الجهاز العصبي المركزي الذي يحدد الفيبروميالجيا.",
    "cycle.mechanism.title": "العلاقة العلمية والبيولوجية",
    "cycle.mechanism.body": "في الطور الأصفري المتأخر (الأيام السابقة مباشرة للحيض) تنخفض الأستروجين والبروجسترون بشكل طبيعي. الأستروجين ينظم السيروتونين والنورإبينفرين — ناقلين عصبيين يكبحان إشارات الألم في الجهاز العصبي المركزي. عند انخفاضهما يضعف التثبيط الألمي، فتظهر حساسية ألم مرتفعة مؤقتًا (فرط الألم)، وإرهاق أعمق، وضباب دماغ أقوى. على جهاز عصبي يضخّم الإشارات أصلًا، قد يدفع هذا الانخفاض الأعراض المستقرة إلى توهج كامل.",
    "cycle.phase.menstrual": "الحيض",
    "cycle.phase.menstrualSub": "الهرمونات في أدنى مستوياتها — تبقى الحساسية مرتفعة غالبًا في بداية أيام النزيف.",
    "cycle.phase.follicular": "الطور الجريبي",
    "cycle.phase.follicularSub": "الأستروجين يصعد — كثيرات يذكرن أفضل أيامهن هنا.",
    "cycle.phase.ovulatory": "الإباضة",
    "cycle.phase.ovulatorySub": "الأستروجين يبلغ ذروته ثم يتأرجح — قد تحدث نوبات حساسية قصيرة.",
    "cycle.phase.luteal": "الطور الأصفري",
    "cycle.phase.lutealSub": "البروجسترون يرتفع ثم ينخفض الهرمونان معًا — تبدأ الحساسية بالتسلل.",
    "cycle.phase.window": "نافذة الخطر قبل الدورة",
    "cycle.phase.windowSub": "نحو 3–7 أيام قبل الحيض — التوقيت الكلاسيكي لتكدس التوهجات في الفيبروميالجيا.",
    "cycle.forecast.title": "التنبؤ بالتوهج قبل وصوله",
    "cycle.forecast.body": "لأن التأثير إيقاعي، يمكن توقعه. الألم الشديد وتيبس العضلات يسبقان الحيض عادة بـ 3 إلى 7 أيام. يتعلم متتبع الدورة في فايبروكير فترتك، وتفتح بطاقة توقعات التوهج في لوحتك نافذة إنذار مبكر — اللحظة المناسبة لتفعيل خطة التوهج: جدول أخف، دفء جاهز، نوم محمي، ودواء في وقته.",
    "cycle.forecast.badge": "نافذة خطر التوهج: قبل الدورة بـ 3–7 أيام",
    "cycle.forecast.hint": "تتحدث بطاقة توقعات التوهج في لوحة التحكم تلقائيًا مع كل تسجيل دورة.",
    "cycle.tips.title": "استراتيجيات الرعاية الذاتية الاستباقية",
    "cycle.tip.spoons.title": "إدارة الملاعق",
    "cycle.tip.spoons.body": "قللي المهام اليومية غير الأساسية بنحو 30% خلال أيام ما قبل الدورة. أنجزي الضروري مبكرًا في الدورة وبرمجي فترات راحة حقيقية.",
    "cycle.tip.heat.title": "العلاج الحراري",
    "cycle.tip.heat.body": "الكمادات الدافئة أو الحمام الدافئ يريحان تشنجات العضلات والتيبس. ضعي الدفء على منطقتي الحوض وأسفل الظهر قبل ذروة التوهج لا بعدها.",
    "cycle.tip.nutrition.title": "الدعم الغذائي",
    "cycle.tip.nutrition.body": "اعتمدي على الأطعمة المضادة للالتهاب — خضروات وأسماك أوميغا 3 وحبوب كاملة — وخففي الكافيين والسكريات المضافة التي قد تضخم الحساسية وتربك النوم.",
    "cycle.image.caption": "شدة أعراض الفيبروميالجيا والدورة الشهرية تتحركان معًا — تتبع الاثنتين يكشف نمطك الشخصي.",
    "cycle.references.title": "المراجع والمصادر الأكاديمية",
    "cycle.references.disclaimer": "هذه المصادر تُعلم المحتوى التعليمي في فايبروكير. وهي ليست نصيحة طبية — منظمات الحمل الهرمونية وعلاج هرمون البديل تغير التجربة الفردية كثيرًا، فناقشي القرارات الهرمونية مع فريق رعايتك.",
    "cycle.ref.cdc": "مراكز مكافحة الأمراض (CDC) — الفيبروميالجيا",
    "cycle.ref.cdc.detail": "إرشادات الصحة العامة الفيدرالية حول الأعراض والمحفزات والإدارة.",
    "cycle.ref.niams": "المعهد الوطني (NIH) — الفيبروميالجيا",
    "cycle.ref.niams.detail": "نظرة معهد التهاب المفاصل والعضلات والجلد على الحالة.",
    "cycle.ref.acr": "الكلية الأمريكية لأمراض الروماتيزم",
    "cycle.ref.acr.detail": "معايير ACR التشخيصية والإرشادات السريرية لطب الروماتيزم.",
    "cycle.ref.cochrane": "مكتبة كوكرين",
    "cycle.ref.cochrane.detail": "مراجعات منهجية لأدلة الألم المزمن وارتباطه الهرموني.",
    "cycle.overview.title": "ما يقوله البحث العلمي",
    "cycle.overview.content": "تُظهر دراسات النساء المصابات بالفيبروميالجيا في سن الإنجاب باستمرار تضخمًا للأعراض قبل الحيض وأثناءه. الآلية المقترحة هي انخفاض الأستروجين والبروجسترون في الطور الأصفري مما يقلل التثبيط الألمي السيروتونيني والنورأدرينالي، فيكشف التحسس المركزي المميز للفيبروميالجيا. تتفاوت النتائج بين الأفراد — بعضهن يذكرن أنماطًا دورية قوية وبعضهن لا يذكرن شيئًا — ولهذا تحديدًا يتفوق التتبع الشخصي على متوسطات عامة.",
    "cycle.overview.plain": "معظم النساء المصابات بالفيبروميالجيا يشعرن بسوء أكبر قبيل الدورة وأثناءها. السبب المحتمل هو انخفاض الهرمونات. نمطك قد يختلف، لذا التتبع أفضل من التخمين.",
    "cycle.tracking.title": "استخدام أدوات الدورة في فايبروكير",
    "cycle.tracking.content": "سجلي تاريخ بداية كل دورة في متتبع الدورة بلوحة التحكم. بعد أول دورة مسجلة يشتق موجز الارتباطات طورك الحالي؛ وبعد بضع دورات تقدّر بطاقة التوقعات نافذة الخطر الشخصية (أيام الدورة، والعد التنازلي، والشدة) وتقرنها بنصائح استباقية. التسجيل اليومي للأعراض يزيد دقة الارتباطات والتوقعات معًا.",
    "cycle.tracking.plain": "أضيفي تواريخ بداية الدورة في لوحة التحكم. يتعلم التطبيق إيقاعك ويحذرك قبل أيام قليلة لتخطيط فترة التوهج مسبقًا.",
    "cycleTracker.title": "متتبع أعراض الدورة",
    "cycleTracker.subtitle": "كيف تتأثر بأعراض الفبروميالغيا عبر مراحل الدورة — وكيف تتعاملين مع كل مرحلة",
    "cycleTracker.logCta": "تسجيل أعراض اليوم",
    "cycleTracker.insightLabel": "رؤية تعامل",
    "cycleTracker.insightShort": "تعامل",
    "cycleTracker.symptomChip.ache": "ألم العضلات",
    "cycleTracker.symptomChip.sleep": "نوم",
    "cycleTracker.symptomChip.fog": "ضبابية",
    "cycleTracker.symptomChip.fatigue": "تعب",
    "cycleTracker.disclaimer": "هذه نمط عام وليس بديلاً عن النصيحة الطبية — كل جسم يستجيب بشكل مختلف.",
    "cycleTracker.symptom.menstrual": "أثناء الدورة الشهرية، تنخفض هرمونات الإستروجين والبروجستيرون بسرعة — مما يرفع حساسية الألم المركزية، لذا غالبًا ما يشعر بألم العضلات وألم المفاصل أسوأ مما هو عليه في بقية الشهر. التعب أيضًا يميل إلى الذروة، جزئيًا بسبب تق 만이다 النوم مع التحول الهرموني.",
    "cycleTracker.symptom.follicular": "مع صعود الإستروجين بعد توقف النزيف، تعود مستويات السيروتونين والنورأدرينالين إلى استقرارها — غالبًا ما يكون عبء الألم أخف ما يكون وقد تشعرين بمزيد من الطاقة. عادةً ما تكون هذه هي النافذة التي يكون فيها الحركة اللطيفة وعلاج الحرارة الأكثر فعالية.",
    "cycleTracker.symptom.ovulatory": "في منتصف الدورة، يبلغ الإستروجين ذروته ثم يسقط بسرعة — مما قد يسبب تذبذبًا قصيرًا يؤثر على الطاقة والتركيز أكثر من الألم بحد ذاته. العديد من المصابين بالفبروميالغيا يلاحظون نافذة قصيرة من الوضوح، ثم يبدأ التعب في العودة.",
    "cycleTracker.symptom.luteal": "في النصف الثاني من الدورة، يرتفع البروجستيرون ثم يهبط — وهذه هي الفترة التي يبدأ فيها الألم في التصاعد، وتظهر تصلب، ويزيد التعب. يصبح التنظيم وعلاج الحرارة أكثر أهمية هنا.",
    "cycleTracker.symptom.window": "نافذة ما قبل الدورة (تقريبًا 3-7 أيام قبل النزيف): ترتبط هذه المرحلة بأكبر تقلب في حساسية الألم والتعب والإرهاق الذهني للكثير من المصابين بالفبروميالغيا — وهي النافذة التي يهدف FibroCare إلى تنبيهك إليها مبكرًا بمجرد إدخال بيانات دورتك.",
    "cycleTracker.insight.menstrual": "خططي للمهمات الثقيلة في وقت مبكر من الشهر. هذه مرحلة مليئة بالراحة — اعطائي أولوية لعلاج الحرارة والامتداد اللطيف وصحة النوم بدلاً من التغلب.",
    "cycleTracker.insight.follicular": "هذه هي النافذة المثلى للمشي اللطيف والحركة ضمن نطاقك — غالبًا ما تكون الطاقة أفضل وينجب الجسم الاستجابة للحركة بسهولة أكبر.",
    "cycleTracker.insight.ovulatory": "توقعي تذبذبًا قصيرًا في الطاقة والتركيز. لا تتبعيها — خذي استراحات قصيرة وجدي المهام الثقيلة حول ذروتك الحقيقية، ليس التقويم.",
    "cycleTracker.insight.luteal": "ابدأي التنظيم الآن — خففي الكثافة، واستخدمي علاج الحرارة قبل أن يبدأ الألم، وراقبي نومك عن كثب.",
    "cycleTracker.insight.window": "هذه هي النافذة التي يصبح فيها التخطيط مسبقًا هو الفرق — استخدمي تنبؤ النوبة في التطبيق للتراجع قبل أن يبدأ، وتذكري أن هذه المرحلة مؤقتة.",
    "diagnosis.check.title": "مدقق الجاهزية للتشخيص الذكي",
    "diagnosis.check.subtitle": "أجب عن 4 أسئلة سريعة لترى كيف تقارن أعراضك بمعايير ACR — ثم صدّر ملخصًا لطبيبك.",
    "diagnosis.check.q.widespread": "ألم واسع في مناطق كثيرة من الجسم، على الجانبين وفوق وتحت الخصر؟",
    "diagnosis.check.q.severity": "إرهاق أو نوم غير مجدٍ أو صعوبة إدراكية؟",
    "diagnosis.check.q.duration": "هل استمرت الأعراض 3 أشهر على الأقل؟",
    "diagnosis.check.q.exclusion": "هل استبعد طبيبك اضطرابات أخرى قد تفسر الألم؟",
    "diagnosis.check.yes": "نعم",
    "diagnosis.check.no": "لا",
    "diagnosis.check.assess": "تحقق من الجاهزية",
    "diagnosis.check.verdict.likely": "إجاباتك تتوافق بشكل كبير مع معايير ACR.",
    "diagnosis.check.verdict.possible": "توافق جزئي — يستحق مناقشته مع طبيبك.",
    "diagnosis.check.verdict.unlikely": "معايير أقل تحققًا — ما زال يستحق مراجعة الطبيب.",
    "diagnosis.check.criteriaLabel": "معايير ACR محققة",
    "diagnosis.check.summaryTitle": "ملخص لطبيبك",
    "diagnosis.check.summary.line1": "ألم واسع في مناطق كثيرة: {answer}",
    "diagnosis.check.summary.line2": "إرهاق أو نوم غير مجدٍ أو صعوبة إدراكية: {answer}",
    "diagnosis.check.summary.line3": "أعراض مستمرة 3 أشهر على الأقل: {answer}",
    "diagnosis.check.summary.line4": "استبعاد اضطرابات أخرى: {answer}",
    "diagnosis.check.copy": "نسخ الملخص",
    "diagnosis.check.copied": "تم النسخ!",
    "diagnosis.check.downloadPdf": "تنزيل PDF",
    "diagnosis.check.disclaimer": "هذه أداة فحص وليست تشخيصًا. الطبيب وحده يمكنه تشخيص التهاب العضلات الليفية.",
    "diagnosis.check.printHint": "أكمل الفحص أعلاه ثم اطبع مرة أخرى للحصول على ورقة الملخص.",
    "treatment.title": "العلاج والرعاية الذاتية",
    "treatment.subtitle": "نهج شامل يجمع بين العلاج الطبي وتعديل نمط الحياة.",
    "treatment.medications": "الأدوية",
    "treatment.therapy": "العلاج الطبيعي",
    "treatment.exercise": "التمارين الرياضية",
    "treatment.stress": "إدارة التوتر",
    "treatment.sleep": "نظافة النوم",
    "treatment.selfCare": "استراتيجيات الرعاية الذاتية",
    "treatment.medicationsContent": "تُستخدم الأدوية لتقليل الألم وتحسين النوم. الأدوية الشائعة تشمل:\n\nدولوكسيتين (Cymbalta): مضاد للاكتئاب يساعد في تقليل الألم المزمن.\n\nبريجابالين (Lyrica): مضاد للنوبات يقلل من إشارات الألم.\n\nميلناسيبران (Savella): مضاد للاكتئاب مخصص لالتهاب العضلات الليفية.\n\nأسيتامينوفين أو مضادات الالتهاب غير الستيرويدية (NSAIDs): يمكن أن تساعد في تخفيف الألم الخفيف.\n\nمن المهم العمل مع طبيبك للعثور على الدواء المناسب والجرعة.",
    "treatment.medicationsPlain": "يمكن للأدوية أن تساعد في تخفيف الألم وتحسين النوم. تشمل الخيارات الشائعة بعض مضادات الاكتئاب (مثل دولوكسيتين)، وبعض أدوية آلام الأعصاب (مثل بريجابالين)، ومسكنات بسيطة. ما يناسب شخصًا قد لا يناسب آخر — سيساعدك طبيبك في إيجاد الخيار المناسب.",
    "treatment.therapyContent": "العلاج الطبيعي يلعب دورًا مهمًا في إدارة التهاب العضلات الليفية:\n\nالتمارين المتدرجة: تقوية العضلات تدريجيًا مع تجنب الإجهاد.\n\nالتمطيط: تحسين المرونة وتقليل التيبس الصباحي.\n\nالعلاج بالماء الدافئ: تخفيف الألم وتحسين الحركة.\n\nالعلاج الحركي: تعلم حركات آمنة للنشاط اليومي.\n\nالعلاج الطبيعي يمكن أن يُعلمك تقنيات لتقليل الألم وتحسين الوظيفة اليومية.",
    "treatment.therapyPlain": "يساعدك العلاج الطبيعي على الحركة بشكل أفضل دون إجهاد: تقوية العضلات تدريجيًا، والتمطيط، وجلسات الماء الدافئ، وتعلم حركات يومية آمنة.",
    "treatment.exerciseContent": "التمارين المنتظمة اللطيفة من أكثر العلاجات فعالية:\n\nالمشي: نشاط منخفض التأثير يمكن تخصيصه حسب قدرتك.\n\nالسباحة: ممتازة لأن الماء يدعم الجسم ويقلل الضغط.\n\nاليوجا: تجمع بين الحركة والتنفس والاسترخاء.\n\nالتمطيط: تقليل التيبس وتحسين المرونة.\n\nالتاي تشي: حركات بطيئة ومدروسة تحسن التوازن والمرونة.\n\nابدأ ببطء وزد من مستوى النشاط تدريجيًا.",
    "treatment.exercisePlain": "التمارين اللطيفة المنتظمة من أكثر العلاجات فائدة. جرّب المشي أو السباحة أو اليوجا أو التمطيط أو التاي تشي. ابدأ صغيرًا وزد تدريجيًا.",
    "treatment.stressContent": "إدارة التوتر ضرورية لأن التوتر يمكن أن يُفاقم الأعراض:\n\nالتأمل والتنفس العميق: تقنيات بسيطة يمكن ممارستها يوميًا.\n\nالعلاج السلوكي المعرفي (CBT): يساعد في تغيير أنماط التفكير السلبية.\n\nإدارة الوقت: تجنب الحِمل الزائد وتحديد الأولويات.\n\nالدعم الاجتماعي: التواصل مع الأصدقاء والعائلة والمجتمع.\n\nالمنافذ الإبداعية: الكتابة والموسيقى والفنون.",
    "treatment.stressPlain": "التوتر يزيد الأعراض سوءًا، لذا تساعد العادات المهدئة: التأمل، والتنفس العميق، والتفكير بأسلوب العلاج السلوكي المعرفي، وتنظيم يومك لتجنب الإرهاق، والبقاء على تواصل مع الآخرين.",
    "treatment.sleepContent": "تحسين جودة النوم ضروري للأمان والراحة:\n\nروتين نوم ثابت: اذهب إلى النوم واستيقظ في نفس الوقت.\n\nبيئة مريحة: غرفة مظلمة وباردة وهادئة.\n\nتجنب الكافيين: خاصة في المساء.\n\nاسترخاء قبل النوم: قراءة أو الاستماع إلى موسيقى هادئة.\n\nحدود الشاشات: قلل من وقت الشاشات قبل النوم.",
    "treatment.sleepPlain": "النوم الأفضل يحسّن كل شيء آخر. حافظ على موعد نوم ثابت، واجعل غرفتك مظلمة وباردة وهادئة، وتجنب الكافيين مساءً، واسترخِ قبل النوم، وقلل وقت الشاشات.",
    "treatment.selfCareContent": "استراتيجيات الرعاية الذاتية تساعدك على إدارة أعراضك يوميًا:\n\nالتخطيط: تقسيم المهام الكبيرة إلى أجزاء أصغر.\n\nالراحة المجدولة: خذ استراحات منتظمة قبل أن تشعر بالإرهاق.\n\nالتسجيل: تتبع الأعراض والمحفزات.\n\nالعلاج بالماء الدافئ: استخدام الأكياس الدافئة أو الحمامات الدافئة.\n\nالتدفئة: ارتداء طبقات للحفاظ على حرارة الجسم.",
    "treatment.selfCarePlain": "العادات اليومية الصغيرة تتراكم: قسّم المهام الكبيرة إلى خطوات أصغر، واسترح قبل أن تُرهق، وتتبع أعراضك، واستخدم الدفء للعضلات المتعبة، وارتدِ طبقات للبقاء دافئًا.",
    "nutrition.title": "التغذية",
    "nutrition.subtitle": "ما تأكله يمكن أن يؤثر بشكل كبير على أعراض التهاب العضلات الليفية.",
    "nutrition.goodFoods": "الأطعمة المساعدة",
    "nutrition.triggers": "المحفزات الشائعة",
    "nutrition.recipes": "أفكار الوجبات",
    "nutrition.hydration": "الترطيب",
    "nutrition.goodFoodsContent": "الأطعمة التي يمكن أن تساعد في تقليل الأعراض:\n\nالأسماك الدهنية (سلمون، سردين، تونة): غنية بأوميغا 3 التي تقلل الالتهاب.\n\nالفواكه والخضروات الملونة: مليئة بمضادات الأكسدة.\n\nالمكسرات والبذور: مصدر صحي للدهون والبروتين.\n\nالحبوب الكاملة: توفر طاقة مستدامة.\n\nالأطعمة المخمرة (الزبادي، الكيمتشي): تدعم صحة الأمعاء.\n\nالزبادي: يدعم صحة الجهاز الهضمي.\n\nزيت الزيتون: دهون أحادية غير مشبعة مفيدة.",
    "nutrition.goodFoodsPlain": "الأطعمة التي قد تساعد: الأسماك الدهنية مثل السلمون والسردين (أوميغا 3)، والفواكه والخضروات الملونة، والمكسرات والبذور، والحبوب الكاملة، والأطعمة المخمرة مثل الزبادي، وزيت الزيتون.",
    "nutrition.goodFoodsHighlight.1": "سمك السلمون والسردين",
    "nutrition.goodFoodsHighlight.2": "الفواكه والخضروات الملونة",
    "nutrition.goodFoodsHighlight.3": "المكسرات والحبوب الكاملة",
    "nutrition.triggersContent": "الأطعمة التي قد تُفاقم الأعراض:\n\nالأطعمة المصنعة: تحتوي على مكونات قد تزيد الالتهاب.\n\nالسكر المضاف: يسبب تقلبات في مستويات الطاقة.\n\nالكافيين: يمكن أن يُفاقم الألم ويعيق النوم.\n\nالكحول: يُضعف جودة النوم ويسبب الجفاف.\n\nالألوان الصناعية والمحسنات: قد تزيد الحساسية.\n\nالأطعمة الدسمة: قد تزيد الالتهاب.\n\nالأطعمة المُبردة: قد تحتوي على مكونات مُحفزة.",
    "nutrition.triggersPlain": "بعض الأطعمة قد تزيد الأعراض سوءًا: الأطعمة المصنعة جدًا، والسكر المضاف، والكافيين، والكحول، والإضافات الصناعية، والوجبات الدسمة. كل شخص مختلف — لاحظ كيف يتفاعل جسمك.",
    "nutrition.recipesContent": "أفكار وجبات صديقة لالتهاب العضلات الليفية:\n\nالإفطار: شوفان مع مكسرات وفواكه طازجة وزبادي.\n\nالغداء: سلطة سلمون مشوي مع أرز بني وخضروات.\n\nالعشاء: صدور دجاج مشوية مع بطاطا حلوة وبروكلي.\n\nالوجبات الخفيفة: مكسرات وخضروات مع حمص.\n\nالمشروبات: شاي أخضر أو شاي الزنجبيل الدافئ.\n\nالعصائر: عصير طازج من البرتقال والجزر.",
    "nutrition.recipesPlain": "أفكار وجبات سهلة: شوفان مع مكسرات وفواكه للإفطار، وسلطة سلمون مشوي للغداء، ودجاج مع بطاطا حلوة وبروكلي للعشاء، ومكسرات أو خضروات مع حمص للوجبات الخفيفة.",
    "nutrition.hydrationContent": "الترطيب ضروري لإدارة أعراض التهاب العضلات الليفية:\n\nاستهدف 8-10 أكواب من الماء يوميًا.\n\nالماء الدافئ مع الليمون يمكن أن يساعد في الهضم.\n\nاشرب الماء بانتظام بدلاً من كميات كبيرة دفعة واحدة.\n\nتجنب المشروبات الغازية والعصائر المحتوية على سكر مضاف.\n\nالشاي الأخضر أو شاي الأعشاب يمكن أن يكون بديلًا صحيًا.\n\nراقب لون البول للتأكد من الترطيب الكافي.",
    "nutrition.hydrationPlain": "الترطيب يدعم الطاقة والتركيز. استهدف 8-10 أكواب من الماء يوميًا، واشرب بانتظام، واستبدل المشروبات السكرية بالماء أو الشاي العشبي.",
    "exercises.title": "التمارين الرياضية",
    "exercises.subtitle": "الحركة اللطيفة والمنتظمة هي مفتاح إدارة ألم وتيبس التهاب العضلات الليفية.",
    "exercises.stretching": "التمطيط اللطيف",
    "exercises.yoga": "يوجا الاسترخاء",
    "exercises.walking": "المشي منخفض التأثير",
    "exercises.swimming": "التمارين المائية",
    "exercises.tips": "نصائح التمارين",
    "exercises.stretchingContent": "التمطيط اللطيف يقلل التيبس ويحسن المرونة:\n\nتمطيط الرقبة: أميل رأسك ببطء إلى كل جانب، احتفظ لمدة 15-30 ثانية.\n\nتمطيط الكتف: حرك كتفيك للأعلى ثم للخلف ببطء.\n\nتمطيط الظهر السفلي: اجلس على حافة الكرسي وميل للأمام بلطف.\n\nتمطيط الفخذ: وقف واحتفظ بقدم واحدة للخلف.\n\nتمطيط ربل الساق: وقف أمام جدار وادفع جدار ببطء.\n\nمدة: احتفظ بكل تمطيط لمدة 15-30 ثانية، تكرار 2-3 مرات.\n\nتنفس بعمق أثناء كل تمطيط.",
    "exercises.stretchingPlain": "التمطيط اللطيف يخفف التيبس: أمِل رأسك إلى كل جانب، وحرّك كتفيك، ومِل للأمام من كرسي لأسفل الظهر، ومطّ ربلتي ساقيك على الحائط. احتفظ بكل وضع 15-30 ثانية وتنفس بعمق.",
    "exercises.stretchingHighlight.1": "15-30 ثانية لكل تمطيط",
    "exercises.stretchingHighlight.2": "تنفس بعمق",
    "exercises.stretchingHighlight.3": "تحرك ببطء",
    "exercises.yogaContent": "اليوجا الاسترخائية ممتازة لالتهاب العضلات الليفية:\n\nوضعية الطفل: استرخِ على ركبتيك مع مد الذراعين للأمام.\n\nالقطة-البقرة: تحرك ببطء بين وضعية الانثناء والثني للخلف.\n\nوضعية الشجرة: وقف على قدم واحدة مع توازن.\n\nالتمطيط الجانبي: وقف وميل جانبيًا ببطء.\n\nوضعية الطفل المبتسم: استرخِ على ظهرك مع رفع الركبتين.\n\nيوجا التنفس: تمارين تنفس بسيطة للاسترخاء.\n\nيجب أن تكون الحركات لطيفة وبدون ألم.",
    "exercises.yogaPlain": "اليوجا الاسترخائية لطيفة جدًا: وضعية الطفل، والقطة-البقرة، ووضعية الشجرة، والطفل المبتسم. تحرك ببطء وتنفس ولا تدفع نفسك إلى الألم.",
    "exercises.walkingContent": "المشي منخفض التأثير وممتاز للتمارين اليومية:\n\nابدأ بـ 5-10 دقائق يوميًا.\n\nزد المدة تدريجيًا بمعدل 1-2 دقيقة كل أسبوع.\n\nاستهدف 20-30 دقيقة في الجلسة الواحدة.\n\nالمشي على أسطح مسطحة أفضل في البداية.\n\nارتدِ حذاءً مريحًا بدعم جيد.\n\nاستخدم عكاز المشي إذا لزم الأمر.\n\nالمشي في الصباح الباكر أو المساء يتجنب الحرارة.\n\nاستمع لجسمك وتوقف إذا شعرت بألم.",
    "exercises.walkingPlain": "المشي بداية رائعة منخفضة التأثير: ابدأ بـ 5-10 دقائق يوميًا، وأضف دقيقة أو دقيقتين كل أسبوع، واستهدف 20-30 دقيقة، وارتدِ حذاءً مريحًا، وتوقف إذا شعرت بألم.",
    "exercises.swimmingContent": "التمارين المائية ممتازة لالتهاب العضلات الليفية:\n\nالماء الدافئ (84-88 درجة فهرنهايت) مريح للعضلات.\n\nتمارين المشي في الماء: مشي في الماء العميق.\n\nتمارين الإطالة في الماء: حركات لطيفة في الماء.\n\nالسباحة الخفيفة: سباحة بضربات بطة.\n\nتمارين الماء الدافئ: في بركة دافئة.\n\nفترة: ابدأ بـ 10-15 دقيقة وزد تدريجيًا.\n\nالسباحة تقلل الضغط على المفاصل وتحسن المرونة.",
    "exercises.swimmingPlain": "التمارين المائية لطيفة على مفاصلك: الماء الدافئ (84-88 درجة فهرنهايت) يريح العضلات. جرّب المشي في الماء أو التمطيط اللطيف أو السباحة الخفيفة لمدة 10-15 دقيقة وزد تدريجيًا.",
    "exercises.tipsContent": "نصائح مهمة لممارسة التمارين مع التهاب العضلات الليفية:\n\nابدأ ببطء: ابدأ بفترات قصيرة وزد تدريجيًا.\n\nاستمع لجسمك: توقف إذا شعرت بألم أكثر من المعتاد.\n\nالانتظام أهم من الشدة: التمارين المنتظمة اللطيفة أفضل من التمارين العنيفة.\n\nالراحة بعد التمرين: خذ وقتًا كافيًا للاسترخاء.\n\nالتمطيط قبل وبعد: داوم على التمطيط قبل وبعد التمرين.\n\nتجنب التمارين في أيام التفاقم.\n\nاشرب الماء بانتظام.\n\nتحدث مع طبيبك قبل بدء أي برنامج تمارين جديد.",
    "exercises.tipsPlain": "قواعد ذهبية: ابدأ ببطء، واستمع لجسمك، والانتظام أهم من الشدة، واسترح بعد التمرين، ومطّ قبل وبعده، وتجنب أيام التفاقم، وتحدث مع طبيبك قبل البدء.",
    "treatment.tag.meds.1": "اتبع جرعة طبيبك",
    "treatment.tag.meds.2": "أبلغ عن الآثار الجانبية",
    "treatment.tag.therapy.1": "خيارات الخط الأول",
    "treatment.tag.therapy.2": "يُجمع مع التمارين",
    "treatment.tag.exercise.1": "ابدأ صغيرًا وزد تدريجيًا",
    "treatment.tag.exercise.2": "الانتظام أفضل من الشدة",
    "treatment.tag.stress.1": "ممارسة يومية 5 دقائق",
    "treatment.tag.stress.2": "تفكير بأسلوب العلاج المعرفي يساعد",
    "treatment.tag.sleep.1": "نفس موعد الاستيقاظ يوميًا",
    "treatment.tag.sleep.2": "لا شاشات قبل النوم",
    "treatment.tag.selfCare.1": "وزّع مجهود يومك",
    "treatment.tag.selfCare.2": "استرح قبل الإرهاق",
    "treatment.quickAdd.title": "أضِف إلى متتبع اليوم",
    "treatment.quickAdd.subtitle": "سجّل ما قمت به اليوم — سيظهر في سجل صحتك.",
    "treatment.quickAdd.added": "تمت الإضافة إلى سجل اليوم",
    "treatment.quickAdd.error": "تعذّر الحفظ — حاول مرة أخرى",
    "treatment.quickAdd.signIn": "سجّل الدخول لحفظ الإدخالات في المتتبع",
    "treatment.quickAdd.item.pacing": "توزيع المجهود — قسّمت مهمة إلى خطوات",
    "treatment.quickAdd.item.rest": "استراحة مجدولة",
    "treatment.quickAdd.item.warm": "علاج دافئ (كمادة أو حمام)",
    "treatment.quickAdd.item.hydration": "شربت الماء بانتظام",
    "treatment.quickAdd.item.movement": "جلسة حركة لطيفة",
    "treatment.quickAdd.item.medication": "دواء (حسب الوصفة)",
    "nutrition.tag.goodFoods.1": "غني بأوميغا-3",
    "nutrition.tag.goodFoods.2": "غني بمضادات الأكسدة",
    "nutrition.tag.triggers.1": "كل شخص مختلف",
    "nutrition.tag.triggers.2": "دوّن يوميات طعام",
    "nutrition.tag.recipes.1": "بسيط ومتوازن",
    "nutrition.tag.recipes.2": "حضّر مسبقًا",
    "nutrition.tag.hydration.1": "اشرب تدريجيًا",
    "nutrition.tag.hydration.2": "راقب لون البول",
    "nutrition.bookmark.title": "أطعمة آمنة تثق بها",
    "nutrition.bookmark.subtitle": "احفظ ما يناسبك — يُحفظ على هذا الجهاز.",
    "nutrition.bookmark.savedCount": "{count} محفوظ",
    "nutrition.bookmark.food.fish": "الأسماك الدهنية (سلمون، سردين)",
    "nutrition.bookmark.food.fruits": "فواكه وخضروات ملونة",
    "nutrition.bookmark.food.nuts": "المكسرات والبذور",
    "nutrition.bookmark.food.wholeGrains": "الحبوب الكاملة",
    "nutrition.bookmark.food.fermented": "الزبادي والأطعمة المخمرة",
    "nutrition.bookmark.food.oliveOil": "زيت الزيتون",
    "nutrition.swap.title": "بدائل المحفزات",
    "nutrition.swap.subtitle": "لا تستطيع تجنب المحفز؟ جرّب بديلًا ألطف.",
    "nutrition.swap.suggest": "اقترح بديلًا",
    "nutrition.swap.suggested": "جرّب هذا بدلًا منه",
    "nutrition.swap.because": "لماذا يساعد",
    "nutrition.swap.trigger.sugar": "السكر المضاف",
    "nutrition.swap.trigger.caffeine": "الكافيين",
    "nutrition.swap.trigger.alcohol": "الكحول",
    "nutrition.swap.trigger.processed": "الأطعمة المصنعة",
    "nutrition.swap.trigger.sodas": "المشروبات الغازية والعصائر السكرية",
    "nutrition.swap.item.sugar": "فاكهة طازجة أو تمر",
    "nutrition.swap.item.caffeine": "شاي أعشاب منزوع الكافيين (بابونج، زنجبيل)",
    "nutrition.swap.item.alcohol": "ماء فوار مع ليمون",
    "nutrition.swap.item.processed": "وجبة خفيفة كاملة (مكسرات، حمص، فاكهة)",
    "nutrition.swap.item.sodas": "ماء أو شاي أعشاب",
    "nutrition.swap.reason.sugar": "حلاوة طبيعية مع ألياف — دون هبوط في الطاقة.",
    "nutrition.swap.reason.caffeine": "يهدئ دون أن يؤثر على النوم.",
    "nutrition.swap.reason.alcohol": "يرطّب ويحمي جودة النوم.",
    "nutrition.swap.reason.processed": "إضافات أقل وطاقة أكثر ثباتًا.",
    "nutrition.swap.reason.sodas": "ترطيب دون سكر مضاف.",
    "exercises.tag.stretching.1": "ثبّت 15-30 ثانية",
    "exercises.tag.stretching.2": "لا تتجاوز الألم أبدًا",
    "exercises.tag.yoga.1": "وضعيات استرخائية",
    "exercises.tag.yoga.2": "استخدم الدعامات للدعم",
    "exercises.tag.walking.1": "ابدأ بـ 5-10 دقائق",
    "exercises.tag.walking.2": "أسطح مستوية",
    "exercises.tag.swimming.1": "ماء دافئ",
    "exercises.tag.swimming.2": "لطيف على المفاصل",
    "exercises.tag.tips.1": "استمع لجسمك",
    "exercises.tag.tips.2": "استرح بين الجلسات",
    "exercises.timer.start": "ابدأ",
    "exercises.timer.pause": "إيقاف مؤقت",
    "exercises.timer.reset": "إعادة ضبط",
    "exercises.timer.done": "انتهى — عمل رائع",
    "exercises.timer.aria": "مؤقت تنازلي، {time} متبقية",
    "exercises.timer.spoons.one": "1 ملعقة طاقة",
    "exercises.timer.spoons.many": "{count} ملعقة طاقة",
    "exercises.timer.stretchingLabel": "جلسة تمدد",
    "exercises.timer.walkingLabel": "جلسة مشي",
    "stretching.intro": "روتين لطيف لمدة 15 دقيقة لتحسين المرونة وتخفيف التوتر. تحرّك ببطء، تنفس بعمق، ولا تتجاوز حد الراحة.",
    "stretching.tipsTitle": "نصائح عامة للتمطيط",
    "stretching.tipsBody": " دِمًيا لمدة 2-3 دقائق قبل التمطيط. احبس كل تمطيط 15-30 ثانية بدون ارتجاج. تنفس بعمق واسترخِ في كل حركة. توقف فورًا إذا شعرت بألم حاد.",
    "stretching.neck.title": "دوران الرقبة",
    "stretching.neck.steps": "اجلس منتصبًا على كرسي مع ارتخاء الكتفين.\nأضِل رأسك ببطء نحو كتفك الأيمن.\nاثبت 5 ثوانٍ مع الشعور بالتمطيط على الجانب الأيسر.\nعُد للمركز وكرر على الجانب الأيسر.\nنفّذ 3 دورانات في كل اتجاه.",
    "stretching.neck.duration": "دقيقتان",
    "stretching.shoulder.title": "رفع الكتفين",
    "stretching.shoulder.steps": "اجلس أو قف مع الذراعين على جانبيك.\nشهيق وارفع كتفيك نحو أذنيك.\nاثبت 3 ثوانٍ مع الشعور ب텀ديد التوتر.\nزفير وخفض كتفيك ببطء.\nكرر 8-10 مرات.",
    "stretching.shoulder.duration": "دقيقتان",
    "stretching.lowerBack.title": "القط والبقرة جالسًا",
    "stretching.lowerBack.steps": "اجلس على كرسي مع القدمين على الأرض واليدان على الركبتين.\nقوس ظهرك برفق محدّقًا للأعلى (وضعية البقرة).\nاثبت 3 ثوانٍ.\nفرد عمودك الفقري محدّقًا بالذقن (وضعية القط).\nاثبت 3 ثوانٍ وكرر 5 مرات.",
    "stretching.lowerBack.duration": "3 دقائق",
    "stretching.thigh.title": "تمطيط الفخذ الرباعي واقفًا",
    "stretching.thigh.steps": "قِف بالقرب من جدار أو كرسي للموازنة.\nثني ركبتك اليمنى جالبًا كعبك نحو مؤخرتك.\nأمسك كاحلك بيدك اليمنى برفق.\nحافظ على ركبتيك متقاربتين وقف منتصبًا.\nاثبت 20 ثانية ثم غيّر الساق.",
    "stretching.thigh.duration": "دقيقتان",
    "stretching.calf.title": "تمطيط السمانة على الجدار",
    "stretching.calf.steps": "قِف مقابل جدار على بعد ذراع تقريبًا.\nخطِّ قدمك اليمنى للخلف مع إبقائها مسطحة على الأرض.\nانحنِ للأمام برفق ضاغطًا يديك على الجدار.\nيجب أن تشعر بالتمطيط في سمانة قدمك اليمنى.\nاثبت 20 ثانية ثم غيّر الجانب.",
    "stretching.calf.duration": "دقيقتان",
    "logging.mood.selfCare": "رعاية ذاتية",
    "faq.title": "الأسئلة الشائعة",
    "faq.subtitle": "إجابات على الأسئلة الشائعة حول العيش مع التهاب العضلات الليفية.",
    "faq.chronic": "هل التهاب العضلات الليفية حالة مزمنة؟",
    "faq.chronicAnswer": "نعم، يعتبر التهاب العضلات الليفية حالة مزمنة (طويلة الأمد). ومع ذلك، يمكن أن تتأرجح الأعراض بمرور الوقت، مع فترات من الاتفاضات والهدوء. يتعلم العديد من الأشخاص إدارة أعراضهم بفعالية مع خطة العلاج وتعديل نمط الحياة المناسبين.",
    "faq.cure": "هل هناك علاج لالتهاب العضلات الليفية؟",
    "faq.cureAnswer": "حاليًا، لا يوجد علاج معروف لالتهاب العضلات الليفية. ومع ذلك، يمكن لمزيج من الأدوية والعلاج والتمارين وإدارة التوتر وتعديلات نمط الحياة أن يقلل الأعراض بشكل كبير ويحسن جودة الحياة. يستمر البحث المستمر في استكشاف نهج علاج جديدة.",
    "faq.pregnancy": "هل يتأثر التهاب العضلات الليفية بالحمل؟",
    "faq.pregnancyAnswer": "التهاب العضلات الليفية لا يسبب عادة مضاعفات أثناء الحمل، لكن الأعراض قد تتغير. بعض النساء يتحسن خلال الحمل، بينما قد تعاني أخريات من زيادة الألم أو الإرهاق. من المهم العمل مع مقدم الرعاية الصحية لإدارة الأعراض بأمان أثناء الحمل.",
    "faq.exercise": "هل التمارين آمنة مع التهاب العضلات الليفية؟",
    "faq.exerciseAnswer": "نعم، التمارين اللطيفة هي في الواقع واحدة من أكثر العلاجات فعالية لالتهاب العضلات الليفية. الأنشطة منخفضة التأثير مثل المشي والسباحة والتمطيط ويوجا يمكن أن تقلل الألم وتحسن النوم وتعزز المزاج. ابدأ ببطء، واستمع لجسمك، وزد من مستوى النشاط تدريجيًا.",
    "faq.diagnosis": "كم يستغرق التشخيص؟",
    "faq.diagnosisAnswer": "قد يستغرق التشخيص وقتًا لأن أعراض التهاب العضلات الليفية تتداخل مع العديد من الحالات الأخرى. في المتوسط، قد يستغرق الأمر عدة أشهر إلى سنوات من ظهور الأعراض إلى التشخيص. الاحتفاظ بسجل الأعراض و طلب تقييم من أخصائي الروماتيزم يمكن أن يسرع العملية.",
    "faq.treatment": "أيه العلاجات تعمل بشكل أفضل؟",
    "faq.treatmentAnswer": "النهج الأكثر فعالية هو عادة متعدد الوسائط، يجمع بين الأدوية (مثل دولوكسيتين أو برغابالين) والعلاج الطبيعي والتمارين المنتظمة اللطيفة والعلاج السلوكي المعرفي (CBT) وتقنيات إدارة التوتر. ما يعمل بشكل أفضل يختلف من شخص لآخر، لذا العثور على المزيج الصحيح يتطلب غالبًا الصبر والتواصل المفتوح مع فريق الرعاية الصحية.",
    "community.title": "المجتمع",
    "community.subtitle": "مساحة دافئة لمشاركة التجارب والنصائح والدعم مع الآخرين الذين يفهمون.",
    "community.shareStory": "شارك قصتك",
    "community.stories": "قصص المرضى",
    "community.tips": "نصائح الأقران",
    "community.support": "الدعم والتشجيع",
    "community.writePlaceholder": "شارك تجربتك أو نصيحة مفيدة أو كلمات تشجيع...",
    "community.postButton": "مشاركة",
    "community.noStories": "كن أول من يشارك قصتك. تجربتك يمكن أن تساعد شخصًا آخر على الشعور بأقل وحدة.",
    "community.loginPrompt": "سجل الدخول لمشاركة قصتك والتواصل مع الآخرين.",
    "community.samplePost.1.content": "بعد التشخيص شعرت بالوحدة. ساعدني هذا المجتمع على إدراك أنني لست الوحيد الذي يخوض هذه المعركة. كانت اليوجا اللطيفة تغييرًا جذريًا لتيبس الصباح لدي.",
    "community.samplePost.1.time": "قبل ساعتين",
    "community.samplePost.2.content": "نصيحة: احتفظ بوسادة تدفئة بجانب سريرك. تستيقظ بعضلات متيبسة؟ ضع الدفء لمدة 15 دقيقة قبل النهوض. يُحدث فرقًا كبيرًا في صباحاتي.",
    "community.samplePost.2.time": "قبل 5 ساعات",
    "community.samplePost.3.content": "إلى كل من يمر بنوبة اشتعال اليوم: أنت أقوى مما تظن. هذه الحالة ستمر. كن لطيفًا مع نفسك. 💜",
    "community.samplePost.3.time": "قبل يوم واحد",
    "community.you": "أنت",
    "community.justNow": "الآن للتو",
    "community.reply": "رد",
    "community.likeAria": "إعجاب ({count})",
    "community.filter.all": "الكل",
    "community.filter.aria": "تصفية المنشورات حسب الفئة",
    "community.translate": "ترجمة",
    "community.translated": "إظهار الأصل",
    "faq.searchPlaceholder": "اطرح سؤالًا… (مثل: الحرارة الدافئة للتيبس)",
    "faq.searchAria": "ابحث في الأسئلة الشائعة",
    "faq.searchClear": "مسح البحث",
    "faq.noMatch": "لا توجد إجابات تطابق سؤالك",
    "faq.noMatchHint": "جرّب كلمات مثل: التمارين، التشخيص، أو العلاج.",
    "dashboard.greeting.morning": "صباح الخير",
    "dashboard.greeting.afternoon": "مساء الخير",
    "dashboard.greeting.evening": "مساء الخير",
    "dashboard.todayMessage": "خذ لحظة للتواصل مع جسدك اليوم.",
    "dashboard.streakAria": "سلسلة تسجيل {count} يوم",
    "dashboard.streakDays": "أيام متتالية",
    "dashboard.checkin.title": "كيف تشعر اليوم؟",
    "dashboard.checkin.subtitle": "تتبع طاقتك وأعراضك يساعد في إدارة النوبات وتحسين الرعاية.",
    "dashboard.energy.title": "كيف طاقتك اليوم؟",
    "dashboard.energy.goodDay": "يوم جيد",
    "dashboard.energy.lowEnergy": "طاقة منخفضة",
    "dashboard.energy.flareUp": "نوبة",
    "dashboard.symptoms.label": "الأعراض والملاحظات (اختياري)",
    "dashboard.symptoms.placeholder": "كيف تشعر بالتحديد؟ أي محفزات أو أعراض؟",
    "dashboard.save.saving": "جارٍ الحفظ...",
    "dashboard.save.submit": "تسجيل دخول اليوم",
    "dashboard.save.success": "تم تسجيل البيانات بنجاح!",
    "dashboard.support.title": "دعم لطيف",
    "dashboard.support.subtitle": "أدوات سريعة لتهدئة جهازك العصبي ورفع حالتك المزاجية.",
    "dashboard.weekly.title": "التقدم الأسبوعي",
    "dashboard.loading": "جارٍ التحميل…",
    "dashboard.noCycleData": "لا توجد بيانات دورة بعد.",
    "health.recommendations.empty": "لا توجد توصيات بعد — استمر في التسجيل لفتح الرؤى.",
    "health.recommendations.noSymptoms": "سجّل بعض الأعراض ومتابعات الألم — تظهر الرؤى عندما تظهر الأنماط.",
    "health.recommendations.noCycle": "سجّل دورتك الشهرية لفتح رؤى الارتباط الهرموني.",
    "health.recommendations.highPriority": "أولوية عالية",
    "health.forecast.levelHigh": "خطر توهج مرتفع",
    "health.forecast.levelModerate": "خطر متوسط",
    "health.forecast.levelLow": "خطر منخفض",
    "health.forecast.advice.pacing": "وزّع طاقتك — خصص فترات راحة قصيرة قبل بداية نافذة الخطر.",
    "health.forecast.advice.heat": "احتفظ بوسادة حرارية قريبة؛ الدفء يخفف توتر العضلات قبل الدورة.",
    "health.forecast.advice.sleep": "حافظ على نومك — الإرهاق يضاعف حساسية التوهج.",
    "health.forecast.advice.hydrate": "اشرب ماءً بكميات كافية وقلل الكافيين في الأيام القادمة.",
    "health.forecast.advice.gentleMovement": "الحركة الخفيفة (مشي قصير، تمارين إطالة) تساعد دون إجهاد.",
    "health.forecast.advice.trackDaily": "سجّل يوميًا حتى تزداد دقة التوقعات مع كل دورة.",
    "health.forecast.noCycleGuidance": "سجّل دورتك الشهرية مرة واحدة لتفعيل توقعات التوهج الشخصية.",
    "health.forecast.title": "توقعات التوهج",
    "health.forecast.periodNow": "الدورة متوقعة الآن",
    "health.forecast.periodIn": "الدورة بعد ~{{days}} يوم",
    "health.forecast.inWindow": "الأيام {{start}}–{{end}} من دورتك الحالية هي نافذة الخطر المرتفع — خففي الإيقاع.",
    "health.forecast.windowAhead": "تُفتح نافذة الخطر بعد ~{{days}} يوم (أيام الدورة {{start}}–{{end}}).",
    "health.forecast.calmHigh": "وضع حماية الطاقة — الراحة قوتك اليوم.",
    "health.forecast.calmModerate": "توازن هادئ — فترات الراحة القصيرة تحافظ على استقرارك.",
    "health.forecast.calmLow": "قاعدة الهدوء — جسمك في إيقاع مستقر ومرن.",
    "health.forecast.calmCta": "افتح جلسة هدوء",
    "health.cycle.emptyGuidance": "لم يتم تسجيل أي دورة بعد. إضافتها تتيح للمحرك ربط الأطوار الهرمونية بضباب الدماغ والمزاج والألم.",
    "health.cycle.logCta": "تسجيل دورة",
    "health.cycle.saveCta": "حفظ الدورة",
    "health.cycle.saveError": "تعذر حفظ الدورة. يرجى المحاولة مرة أخرى.",
    "health.cycle.startDateAria": "تاريخ بداية الدورة",
    "health.cycle.phaseAria": "طور الدورة",
    "health.phase.menstrual": "الحيض",
    "health.phase.follicular": "الجرابية",
    "health.phase.ovulatory": "الإباضة",
    "health.phase.luteal": "الأصفارية",
    "health.phase.unknown": "طور غير معروف",
    "health.flareWindow": "نافذة النوبات",
    "health.currentDay": "اليوم الحالي",
    "health.flareRisk": "خطر النوبة",
    "health.symptomMap.title": "خريطة الأعراض",
    "health.symptomMap.quickLog": "تسجيل سريع",
    "health.category.physical": "جسدي",
    "health.category.cognitive": "إدراكي",
    "health.category.mood": "مزاجي",
    "health.quickLog.brainFog": "ضباب الدماغ",
    "health.quickLog.focusFatigue": "إجهاد التركيز",
    "health.quickLog.jointPain": "ألم المفاصل",
    "health.quickLog.emotionalExhaustion": "إنهاك عاطفي",
    "health.doctorSummaryTitle": "الملخص الصحي التحليلي",
    "health.correlationAlerts": "تنبيهات الارتباط",
    "health.topHotspots": "أكثر المناطق ألمًا",
    "health.categoryAverages": "متوسطات الفئات",
    "health.physical": "جسدي",
    "health.cognitive": "إدراكي",
    "health.mood": "مزاجي",
    "health.area.pelvic": "الحوض",
    "health.area.lower_back": "أسفل الظهر",
    "health.area.widespread": "منتشر",
    "health.area.joints": "المفاصل",
    "health.area.other": "أخرى",
    "health.menstrualLog.title": "السجل اليومي للدورة",
    "health.menstrualLog.flow.title": "شدة النزيف",
    "health.menstrualLog.flow.spotting": "تنقيط",
    "health.menstrualLog.flow.light": "خفيف",
    "health.menstrualLog.flow.medium": "متوسط",
    "health.menstrualLog.flow.heavy": "غزير",
    "health.menstrualLog.flow.hasClots": "تخثرات دموية",
    "health.menstrualLog.flow.color": "لون النزيف",
    "health.menstrualLog.somatic.title": "أعراض الألم العضلي الليفي",
    "health.menstrualLog.somatic.cramps": "شدة التشنجات",
    "health.menstrualLog.somatic.headache": "شدة الصداع",
    "health.menstrualLog.somatic.breastTenderness": "حساسية الثدي",
    "health.menstrualLog.somatic.bloating": "الانتفاخ",
    "health.menstrualLog.gi.title": "الهضم والالتهاب",
    "health.menstrualLog.gi.diarrhea": "إسهال",
    "health.menstrualLog.gi.constipation": "إمساك",
    "health.menstrualLog.gi.acne": "حب الشباب الهرموني",
    "health.menstrualLog.fertility.title": "علامات الإباضة والخصوبة",
    "health.menstrualLog.fertility.cervicalMucus": "مخاط عنق الرحم",
    "health.menstrualLog.fertility.opk": "نتيجة اختبار الإباضة",
    "health.menstrualLog.mood.title": "المزاج والحدة العاطفية",
    "health.menstrualLog.mood.tearfulness": "ميل للبكاء",
    "health.menstrualLog.mood.anxiety": "مستوى القلق",
    "health.menstrualLog.mood.volatility": "تقلب المزاج",
    "health.menstrualLog.mucus.dry": "جاف",
    "health.menstrualLog.mucus.sticky": "لزج",
    "health.menstrualLog.mucus.creamy": "قشدي",
    "health.menstrualLog.mucus.watery": "مائي",
    "health.menstrualLog.mucus.eggWhite": "بياض البيض",
    "health.menstrualLog.opk.negative": "سلبي",
    "health.menstrualLog.opk.positive": "إيجابي",
    "health.menstrualLog.opk.notUsed": "غير مستخدم",
    "health.menstrualLog.sensory.none": "لا شيء",
    "health.menstrualLog.sensory.mild": "خفيف",
    "health.menstrualLog.sensory.moderate": "متوسط",
    "health.menstrualLog.sensory.severe": "شديد",
    "health.menstrualLog.notesLabel": "ملاحظات",
    "health.menstrualLog.energy.title": "الطاقة الحيوية اليومية",
    "health.menstrualLog.libido.title": "الرغبة والحيوية",
    "health.menstrualLog.sensory.title": "الحساسية الحسية",
    "health.menstrualLog.sensory.light": "حساسية الضوء",
    "health.menstrualLog.sensory.sound": "حساسية الصوت",
    "health.menstrualLog.saveCta": "حفظ السجل اليومي",
    "health.menstrualLog.savedOk": "تم حفظ السجل اليومي — خريطة الارتباطات أصبحت أكثر دقة.",
    "health.menstrualLog.saveError": "تعذر حفظ السجل اليومي. يرجى المحاولة مرة أخرى.",
    "health.menstrualLog.noActiveCycle": "لا توجد دورة نشطة بعد",
    "health.menstrualLog.createCycleFirst": "أنشئ دورة أولاً — يرتبط السجل اليومي بطور الدورة الحالي.",
    "health.overlap.title": "درجة التداخل الليفي-الهرموني",
    "health.overlap.hormonal": "التضخيم الهرموني",
    "health.overlap.physical": "المجهود البدني",
    "health.overlap.noData": "سجّل بضعة أيام لتظهر نسبة تفاقم الأعراض الهرمونية.",
    "health.carePlan.title": "خطة العناية حسب الطور",
    "health.carePlan.diet": "النظام الغذائي",
    "health.carePlan.supplements": "المكملات",
    "health.carePlan.pacing": "إيقاع النشاط",
    "health.carePlan.currentPhase": "الطور الحالي",
    "health.carePlan.diet.menstrual": "ركزي على الأطعمة الغنية بالحديد والوجبات الدافئة سهلة الهضم؛ الحساء الخفيف يخفف التشنجات.",
    "health.carePlan.diet.follicular": "الطاقة ترتفع — اختاري البروتينات الخفيفة والأطعمة المخمرة والخضروات الطازجة لدعم تصفية الهرمونات.",
    "health.carePlan.diet.ovulatory": "اشربي الماء بكثرة، حافظي على الألياف العالية، وقللي السكريات البسيطة حول الذروة لتثبيت المزاج.",
    "health.carePlan.diet.luteal": "زيدي المغنيسيوم والكربوهيدرات المعقدة والخضروات الورقية؛ خففي الملح والكافيين لتخفيف أعراض ما قبل الحيض.",
    "health.carePlan.supplements.menstrual": "قد يساعد فيتامين د3 مع مغنيسيوم الغلايسين في تخفيف تقلصات الحيض — أكدي الجرعة مع طبيبك.",
    "health.carePlan.supplements.follicular": "فيتامين ب المركب يدعم أيض الإستروجين؛ فكري في فحص الحديد إذا كان النزيف غزيرًا.",
    "health.carePlan.supplements.ovulatory": "أوميغا-3 تساعد في تهدئة قمم الالتهاب؛ احتفظي بالزنك كخيار داعم قصير في الطور الأصفري.",
    "health.carePlan.supplements.luteal": "المغنيسيوم مع فيتامين ب6 هما الثنائي الكلاسيكي للطوارف المزاجية والانتفاخ قبل الحيض.",
    "health.carePlan.pacing.menstrual": "عاملي أول يومين كخط أساس صارم للراحة — قسمي المهام وأجلي المجهود الشاق.",
    "health.carePlan.pacing.follicular": "هذه أقوى مساحة طاقة لديك — خططي للأعمال الصعبة والتمارين الآن.",
    "health.carePlan.pacing.ovulatory": "يوم رائع لذروة التركيز — احميه باستراحة قصيرة في منتصف النهار ونوم مبكر.",
    "health.carePlan.pacing.luteal": "قلصي قائمة مهامك، أضيفي فترات راحة 10 دقائق، واجعل الحركة لطيفة (مشي، إطالة).",
    "health.spoonCalc.title": "حاسبة طاقة النظرية الملعقية",
    "health.spoonCalc.subtitle": "وزّع ملاعق طاقتك اليومية بناءً على النوم وطور الدورة.",
    "health.spoonCalc.budget": "الملاعق المخصصة",
    "health.spoonCalc.sleepQuality": "جودة نوم الليلة الماضية",
    "health.spoonCalc.cycleAdjust": "تعديل طور الدورة",
    "health.spoonCalc.available": "متاحة اليوم",
    "health.clinicalReport.title": "التقرير السريري",
    "health.clinicalReport.subtitle": "ملخص جاهز للطبيب يوضح الارتباط بين الدورة والأعراض.",
    "health.clinicalReport.generate": "إنشاء التقرير",
    "health.clinicalReport.generating": "جاري الإنشاء…",
    "health.clinicalReport.periodRange": "الدورات المحللة",
    "health.clinicalReport.peakPain": "ذروة مستوى الألم",
    "health.clinicalReport.avgEnergy": "متوسط الطاقة (1-10)",
    "health.clinicalReport.avgMood": "متوسط درجة المزاج",
    "health.clinicalReport.symptomSummary": "أهم ارتباطات الأعراض",
    "health.clinicalReport.printCta": "طباعة / حفظ PDF",
    "health.clinicalReport.emptyState": "البيانات غير كافية بعد — سجّل دورتك وأعراضك لقراءة تقرير واضح.",
    "health.caregiver.title": "مزامنة مقدم الرعاية / الشريك",
    "health.caregiver.subtitle": "شارك رابط توقعات النوبات للقراءة فقط مع من يرعاك.",
    "health.caregiver.enable": "تفعيل المشاركة الآمنة",
    "health.caregiver.disable": "تعطيل المشاركة",
    "health.caregiver.shareToken": "رابط المشاركة",
    "health.caregiver.copied": "تم نسخ الرابط إلى الحافظة.",
    "health.caregiver.disclaimer": "تظل يومياتك ودرجاتك وملاحظاتك خاصة — فقط توقعات النوبة القادمة تظهر للمشاهد.",
    "health.caregiver.viewOnly": "للقراءة فقط للمشاهد",
    "dashboard.weekly.subtitle": "مستويات ألمك خلال آخر 7 أيام.",
    "dashboard.weekly.avgPain": "متوسط الألم",
    "dashboard.weekly.daysLogged": "أيام مسجلة",
    "dashboard.weekly.highest": "الأعلى",
    "dashboard.weekly.scale": "/10",
    "dashboard.insights.title": "رؤى الذكاء الاصطناعي",
    "dashboard.insights.subtitle": "أنماط مكتشفة من سجلاتك الأخيرة.",
    "dashboard.insights.empty": "سجّل الألم والأعراض لمدة 5 أيام على الأقل لفتح رؤى مخصصة.",
    "dashboard.toast.message": "يبدو أن اليوم صعب. هل تود التبديل إلى وضع التهدئة وأخذ 3 دقائق لنفسك؟",
    "dashboard.toast.title": "نحن هنا معك",
    "dashboard.toast.dismissAria": "إغلاق الرسالة",
    "dashboard.toast.calming": "وضع التهدئة",
    "dashboard.toast.zen": "بوابة الزن",
    "auth.passwordShow": "إظهار {label}",
    "auth.passwordHide": "إخفاء {label}",
    "common.close": "إغلاق",
    "privacy.unlockDialogAria": "أدخل رمز PIN لفتح FibroCare",
    "privacy.lockedTitle": "مساحتك مقفلة",
    "privacy.enterPin": "أدخل رمز PIN المكوّن من 4 أرقام",
    "privacy.incorrectPin": "رمز PIN غير صحيح. حاول مرة أخرى.",
    "privacy.digitAria": "الرقم {digit}",
    "privacy.deleteDigitAria": "حذف آخر رقم",
    "privacy.digitsEnteredAria": "تم إدخال {length} من {total} أرقام",
    "privacy.forgotPin": "نسيت رمز PIN؟",
    "privacy.useBiometrics": "استخدام البصمة",
    "privacy.biometricScanning": "في انتظار مستشعر البصمة…",
    "pricing.title": "خطط فيبروكير",
    "pricing.subtitle": "سجلاتك وبياناتك مجانية دائمًا. Pro يضيف عمل الذكاء الاصطناعي الأعمق فوقها.",
    "pricing.free.name": "مجاني",
    "pricing.free.price": "$0",
    "pricing.free.perk1": "تسجيل غير محدود للألم والأعراض والملاعق",
    "pricing.free.perk2": "خريطة الجسم ووضع النوبات وأدوات الحركة",
    "pricing.free.perk3": "تثبيت دون اتصال (PWA) مع تشفير محلي",
    "pricing.free.perk4": "ملخص PDF لـ 30/90 يومًا",
    "pricing.pro.badge": "برو",
    "pricing.pro.name": "فيبروكير برو",
    "pricing.pro.price": "$6",
    "pricing.pro.period": "/ شهريًا",
    "pricing.pro.perk1": "رفيق الذكاء الاصطناعي المتعاطف بذاكرة صحتك",
    "pricing.pro.perk2": "الملخص السريري للطبيب وتصدير PDF",
    "pricing.pro.perk3": "قسم الأطباء المخصص لنشر النصائح والمقالات الطبية الموثوقة",
    "pricing.pro.perk4": "التواصل المباشر مع الطبيب: غرفة شات آمنة",
    "pricing.pro.perk5": "المساعد الذكي الطبي لتلخيص الحالة وصياغة الأسئلة",
    "pricing.pro.perk6": "متوقع النوبات والطقس بالسلاسل الزمنية",
    "pricing.pro.perk7": "ماجستركلاسات الفيديو الموجّهة",
    "pricing.upgradeCta": "الترقية إلى برو",
    "pricing.comingSoon": "قريبًا",
    "pricing.footnote": "يمكنك الإلغاء في أي وقت. بياناتك الصحية لا تغادر جهازك ما لم تصدّرها بنفسك.",
    "pricing.previewTitle": "هذه ميزة برو",
    "pricing.previewBody": "يمكنك رؤية معاينة هنا. برو يفتح النسخة الكاملة، وسجلاتك تبقى مجانية في كل الأحوال.",
    "profile.pricing": "ترقية الحساب · FibroCare Pro",
    "privacy.security.title": "الخصوصية والأمان",
    "privacy.security.subtitle": "بياناتك الصحية تبقى على جهازك ما لم تصدّرها بنفسك.",
    "privacy.security.encryption": "تشفير البيانات المحلية",
    "privacy.security.encryptionDesc": "الإدخالات المحلية الحساسة تُشفَّر بخوارزمية AES-GCM قبل تخزينها في هذا المتصفح.",
    "privacy.security.active": "مُفعّل",
    "privacy.security.unavailable": "غير متاح",
    "privacy.security.analytics": "إلغاء الاشتراك في التحليلات",
    "privacy.security.analyticsDesc": "لا تعمل أي تحليلات اليوم، ويُحفَظ هذا التفضيل لتخطّاك في أي تحليلات مستقبلية.",
    "privacy.security.export": "تصدير بياناتي",
    "privacy.security.exportDesc": "ينزّل نسخة JSON مشفّرة لكل ما هو مخزّن محليًا. اختر عبارة مرور من 8 أحرف على الأقل؛ لا تغادر هذا الجهاز أبدًا، ولا يمكن قراءة الملف بدونها.",
    "privacy.security.passphrase": "عبارة مرور التصدير (8 أحرف فأكثر)",
    "privacy.security.exportBtn": "تصدير",
    "privacy.security.exportDone": "تم تنزيل التصدير المشفّر. احفظ عبارة المرور؛ لا يمكن استعادتها.",
    "privacy.security.exportError": "فشل التصدير. تأكد أن عبارة المرور 8 أحرف على الأقل.",
    "privacy.security.purge": "محو كل البيانات الصحية المحلية",
    "privacy.security.purgeDesc": "يزيل كل إدخالات FibroCare من هذا المتصفح: الذاكرات المؤقتة والتفضيلات وحالة الجلسة والملفات دون اتصال. تفضيل اللغة وبيانات الخادم لا يتأثران.",
    "privacy.security.purgeBtn": "محو الآن",
    "privacy.security.purgeConfirmTitle": "حذف كل ما خزّنه FibroCare في هذا المتصفح؟",
    "privacy.security.purgeConfirmBody": "لا يمكن التراجع. السجلات والتفضيلات والذاكرات المؤقتة على هذا الجهاز ستُمحى. بيانات حسابك على الخادم تبقى كما هي.",
    "privacy.security.purged": "تمت إزالة {count} عنصرًا محليًا{items}.",
    "privacy.biometricFailed": "فشل الفتح بالبصمة. حاول مرة أخرى.",
    "privacy.resetPinTitle": "إعادة تعيين رمز PIN",
    "privacy.resetPinCloseAria": "إغلاق نافذة إعادة تعيين رمز PIN",
    "privacy.resetPinPrompt": "اختر رمز PIN جديدًا من 4 أرقام لـ {email}.",
    "privacy.resetPinNew": "رمز PIN الجديد",
    "privacy.resetPinConfirm": "تأكيد رمز PIN الجديد",
    "privacy.resetPinAction": "إعادة تعيين الرمز",
    "privacy.resetPinNotSignedIn": "يجب تسجيل الدخول لإعادة تعيين رمز PIN.",
    "privacy.resetPinSignIn": "تسجيل الدخول",
    "privacy.setupDialogAria": "تعيين رمز PIN للخصوصية",
    "privacy.protectTitle": "احمِ بياناتك الصحية",
    "privacy.choosePin": "اختر رمز PIN من 4 أرقام",
    "privacy.confirmPin": "تأكيد رمز PIN",
    "privacy.pinMismatch": "الرموز غير متطابقة. ابدأ من جديد.",
    "quickActions.ariaLabel": "إجراءات سريعة",
    "quickActions.checkin.title": "التسجيل اليومي",
    "quickActions.checkin.description": "سجل طاقتك وألمك وأعراضك",
    "quickActions.logs.title": "سجلات الصحة",
    "quickActions.logs.description": "تصفح سجل تسجيلاتك",
    "quickActions.reports.title": "التقارير الطبية",
    "quickActions.reports.description": "صدّر ملخصًا لفريق الرعاية الخاص بك",
    "quickActions.resources.title": "موارد الرعاية",
    "quickActions.resources.description": "إرشادات لطيفة ونصائح عملية",
    "quickActions.consultations.title": "الاستشارات",
    "quickActions.consultations.description": "نظم أعراضك وراسل طبيبك",
    "logging.presets.ariaLabel": "إعدادات التسجيل السريعة",
    "logging.presets.calmDay": "يوم هادئ",
    "logging.presets.mildFlare": "نوبة خفيفة",
    "logging.presets.severeFlare": "نوبة شديدة",
    "logging.symptoms.widespreadPain": "ألم منتشر",
    "logging.symptoms.fatigue": "إرهاق",
    "logging.symptoms.sleepProblems": "مشاكل النوم",
    "logging.symptoms.fibroFog": "ضباب الألياف",
    "logging.symptoms.headache": "صداع / شقيقة",
    "logging.symptoms.tenderPoints": "نقاط حساسة",
    "logging.symptoms.stiffness": "تيبس",
    "logging.symptoms.sensitivity": "حساسية للضوء/الضوضاء",
    "logging.symptoms.selected": "(محدد)",
    "logging.slider.label": "مستوى الألم",
    "logging.slider.ariaLabel": "مستوى الألم",
    "logging.slider.calm": "هادئ",
    "logging.slider.moderate": "متوسط",
    "logging.slider.intense": "شديد",
    "flare.title": "وضع الطوارئ للنوبة",
    "flare.on": "مفعّل",
    "flare.off": "متوقف",
    "flare.activateAria": "تفعيل وضع الطوارئ للنوبة",
    "flare.deactivateAria": "إيقاف وضع الطوارئ للنوبة",
    "flare.dimmedMessage": "الشاشة معتمة والحركة ساكنة. لست وحدك — إليك الأشخاص الذين يمكنهم مساعدتك الآن.",
    "flare.armedDescription": "اضغط لتفعيل عرض مهدئ ومرتب مع موارد الأزمات للنوبات الشديدة.",
    "flare.suggestion": " يبدو أن آخر تسجيل لك هو نوبة — فكر في تفعيل هذا.",
    "flare.crisisOptionsAria": "خيارات الدعم في الأزمات",
    "flare.crisis.emergencyLabel": "في خطر فوري — اتصل بخدمات الطوارئ",
    "flare.crisis.emergencyValue": "911 (أو الرقم المحلي)",
    "flare.crisis.suicideLabel": "دعم الأزمات للولايات المتحدة/كندا",
    "flare.crisis.suicideValue": "988 خط مساعدة الأزمات والانتحار",
    "flare.crisis.samaritansLabel": "ساماريتانز المملكة المتحدة/أيرلندا",
    "flare.crisis.samaritansValue": "116 123 (مجاني، 24/7)",
    "today.title": "سياق اليوم",
    "today.liveWeather": "طقس مباشر · {location}",
    "today.temp": "درجة الحرارة",
    "today.humidity": "الرطوبة",
    "today.pressure": "الضغط الجوي",
    "today.impact.low": "الضغط المنخفض قد يزيد حساسية الألم",
    "today.impact.high": "الضغط المرتفع قد يسبب الصداع",
    "today.impact.normal": "الضغط ضمن النطاق المريح",
    "today.status.stable": "الضغط الجوي مستقر ضمن النطاق المريح.",
    "today.status.pressureDrop": "تنبيه: انخفاض في الضغط الجوي قد يؤثر على المفاصل.",
    "today.trigger.humidityHigh": "رطوبة عالية اليوم قد تثقل على المفاصل الحساسة.",
    "today.trigger.heat": "حرارة شديدة — احرص على البرودة والترطيب.",
    "today.trigger.cold": "البرد الشديد قد يزيد التيبس — حافظ على دفئك.",
    "today.triggers.neutral": "سجل أعراضك اليومية لمتابعة محفزات الطقس عند تفعيل الخدمة.",
    "today.estimated": "قيم تقريبية (واجهة الطقس غير مهيأة)",
    "recent.title": "السجلات الأخيرة",
    "recent.empty": "لا توجد سجلات بعد. ابدأ التسجيل لترى سجلك هنا.",
    "recent.today": "اليوم",
    "recent.painAria": "مستوى الألم {level}",
    "recent.pain.levelLow": "خفيف",
    "recent.pain.levelMild": "بسيط",
    "recent.pain.levelModerate": "متوسط",
    "recent.pain.levelHigh": "مرتفع",
    "recent.pain.levelSevere": "شديد",
    "quotes.quote1": "جسدك هو بيتك. عامله باللطف الذي يستحقه.",
    "quotes.quote2": "الراحة ليست كسلًا. إنها أساس الشفاء.",
    "quotes.quote3": "كل خطوة صغيرة إلى الأمام هي تقدم. كن لطيفًا مع نفسك.",
    "quotes.quote4": "أنت أكثر من تشخيصك. قوتك هي ما تعرفك.",
    "quotes.quote5": "استمع إلى جسدك اليوم. هو يعرف ما يحتاجه.",
    "quotes.quote6": "الشفاء ليس خطيًا. كل يوم سيئ يعقبه يوم أفضل.",
    "quotes.quote7": "أنت تستحق التعاطف، خاصةً من نفسك.",
    "quotes.quote8": "استنشق الهدوء، وازفر التوتر. أنت آمن في هذه اللحظة.",
    "quotes.quote9": "قيمتك لا تُقاس بإنتاجيتك.",
    "quotes.quote10": "اليوم، اختر السلام على الكمال.",
    "quotes.quote11": "حركة لطيفة، أفكار لطيفة، حديث ذات لطيف.",
    "quotes.quote12": "لقد نجوت من كل يوم صعب حتى الآن. ستنجو من هذا أيضًا.",
    "quotes.author": "فيبروكير",
    "medical.title": "الملخص الطبي الذكي",
    "medical.subtitle": "رؤى رئيسية واتجاهات الألم وأسئلة لطرحها على طبيبك.",
    "medical.generate": "إنشاء الملخص الطبي",
    "medical.analyzing": "جارٍ التحليل…",
    "medical.avgPain": "متوسط الألم",
    "medical.flareDays": "أيام النوبة",
    "medical.logs": "السجلات",
    "medical.painTrend": "اتجاه الألم (آخر 7 أيام)",
    "medical.keyInsights": "رؤى رئيسية",
    "medical.insightsEmpty": "واصل تسجيل الألم والأعراض لمدة 5 أيام على الأقل لفتح رؤى مخصصة.",
    "medical.questions": "أسئلة لطبيبك",
    "medical.question.flare": "سجّلنا {count} يوم نوبات آخر 30 يومًا. هل يمكننا مراجعة ما قد يسببها وتعديل خطتي؟",
    "medical.question.highPain": "متوسط ألمي مرتفع — هل الأدوية والجرعات الحالية لا تزال مناسبة؟",
    "medical.question.fatigue": "الإرهاق ومشاكل النوم تظهر باستمرار في سجلاتي — هل يمكننا استكشاف استراتيجيات الطاقة والنوم؟",
    "medical.question.sensory": "الحساسية الحسية تظهر في أنماطي. هل هناك تغييرات في الوتيرة أو البيئة يمكن أن تقللها؟",
    "medical.question.movement": "ما مستوى الحركة أو العلاج الطبيعي الآمن لي الآن دون تفاقم الأعراض؟",
    "medical.question.tracking": "كيف يمكنني تسجيل أو تدوين بشكل مختلف ليكون مراجعتنا القادمة أكثر فائدة؟",
    "medical.summaryFor": "الملخص الطبي للمريض {name}",
    "medical.generated": "تم الإنشاء في {date}",
    "medical.close": "إغلاق",
    "medical.error": "تعذر إنشاء ملخصك.",
    "medical.generatingAria": "جارٍ إنشاء أسئلة الذكاء الاصطناعي",
    "reports.pageTitle": "التقارير الطبية",
    "reports.pageSubtitle": "ملخّص 90 يومًا من الألم والنوبات والأعراض والأنماط، جاهز لطبيبك المختص.",
    "reports.loading": "جارٍ تحليل بياناتك الصحية…",
    "reports.loadError": "تعذّر تحميل بيانات التقرير.",
    "reports.snapshotAria": "لمحة عن التقرير",
    "reports.stat.avgPain": "متوسط الألم · 90 يومًا",
    "reports.stat.flareDays": "أيام النوبات",
    "reports.stat.topSymptoms": "أبرز الأعراض",
    "reports.stat.noneRecorded": "لا توجد أعراض مسجّلة",
    "reports.stat.symptom.widespreadPain": "آلام منتشرات",
    "reports.stat.symptom.fatigue": "إرهاق",
    "reports.stat.symptom.sleepProblems": "مشاكل النوم",
    "reports.stat.symptom.fibroFog": "ضبابية الذهن",
    "reports.stat.symptom.headache": "صداع / شقيقة",
    "reports.stat.symptom.tenderPoints": "نقاط حساسة",
    "reports.stat.symptom.stiffness": "تيبس",
    "reports.stat.symptom.sensitivity": "حساسية للضوء/الضوضاء",
    "reports.insights.subtitle": "ملاحظات مستندة إلى بيانات تسجيلاتك.",
    "reports.insights.empty": "سجّل 5 أيام على الأقل من الألم والأعراض لتفعيل رؤى مخصّصة لك.",
    "reports.insights.filterLabel": "تصفية الرؤى حسب الشدة",
    "reports.insights.none": "لا توجد رؤى بعد. واصل التسجيل بانتظام.",
    "reports.insights.noneFor": "لا توجد رؤى {filter} في الوقت الحالي.",
    "reports.severity.critical": "حرجة",
    "reports.severity.warning": "انتبه",
    "reports.severity.info": "ملاحظة",
    "reports.brief.title": "الملخص التنفيذي السريري بالذكاء الاصطناعي (30 يومًا)",
    "reports.brief.subtitle": "لمحة من صفحة واحدة عن اتجاهاتك، بصياغة سريرية لفريقك الطبي.",
    "reports.brief.flareFrequency": "تكرار الاشتعال",
    "reports.brief.flareDaysUnit": "يوم اشتعال",
    "reports.brief.velocity": "سرعة تغيّر الأعراض",
    "reports.brief.functional": "القدرة الوظيفية",
    "reports.brief.adherence": "التزام بالتسجيل",
    "reports.brief.medications": "الأدوية المذكورة بواسطة المريض",
    "reports.brief.discussion": "نقاط مقترحة للمناقشة",
    "reports.brief.headline": "متوسط الألم خلال {days} يومًا هو {avg}/10 مع {flares}؛ {velocity}.",
    "reports.brief.headline.noData": "لا توجد بيانات مسجلة في هذه الفترة — لا يمكن للملخص تحديد الحالة الحالية.",
    "reports.brief.flareDays.zero": "بدون أيام اشتعال",
    "reports.brief.flareDays.one": "يوم اشتعال واحد",
    "reports.brief.flareDays.two": "يومان اشتعال",
    "reports.brief.flareDays.few": "{count} أيام اشتعال",
    "reports.brief.flareDays.many": "{count} يوم اشتعال",
    "reports.brief.ratePerMonth": "~{perMonth}/شهر",
    "reports.brief.velocity.improving": "تحسّن",
    "reports.brief.velocity.stable": "مستقر",
    "reports.brief.velocity.worsening": "يتدهور",
    "reports.brief.velocity.insufficientData": "بيانات غير كافية",
    "reports.brief.trend.rising": "في ارتفاع",
    "reports.brief.trend.falling": "في تراجع",
    "reports.brief.trend.stable": "مستقر",
    "reports.brief.trend.insufficientData": "بيانات غير كافية",
    "reports.brief.streakDays": "{count} يومًا متواصلة من التسجيل",
    "reports.brief.discussion.worsening": "مسار الأعراض يتدهور — هل ما زالت خطة العلاج الحالية مناسبة؟",
    "reports.brief.discussion.painControl": "متوسط الألم {avg}/10 لا يزال مهمًا سريريًا — خيارات للتحكم الأفضل",
    "reports.brief.discussion.medicationsList": "المريض يذكر تناول: {meds} — تأكد من النظام الدوائي والالتزام والتحمّل.",
    "reports.brief.discussion.noMedications": "لا ذكر لأدوية في السجلات — هل يتناول المريض أي علاج دوائي حاليًا؟",
    "reports.brief.discussion.sleep": "اضطراب النوم من أكثر الأعراض المُبلَّغ عنها — يُنصح بتقييم إدارة النوم.",
    "reports.brief.discussion.weather": "تم رصد ارتباط بالطقس ({factors}) — ناقش إدارة المحفزات البيئية.",
    "reports.brief.discussion.default": "الاستمرار على الخطة الحالية مع تعزيز تنظيم النشاط والتمارين المتدرجة ونظافة النوم.",
    "reports.brief.caveat": "تم الإنشاء بناءً على {logged} من {total} يومًا تم تسجيلها بواسطة المريض ({adherence}% نسبة الالتزام). بيانات مدخلة ذاتيًا؛ وليست تقييمًا سريريًا أو تشخيصًا.",
    "reports.filter.all": "الكل",
    "reports.download.title": "الملخّص السريري PDF",
    "reports.download.description": "يتضمّن مخطط اتجاه الألم لآخر 30 يومًا، وملخّص الارتباطات، والرؤى الرئيسية، وملحق السجلّ الكامل.",
    "reports.download.generating": "جارٍ إنشاء التقرير…",
    "reports.download.button": "تنزيل تقرير PDF",
    "reports.exportError": "تعذّر إنشاء التقرير",
    "reports.brief.detectedTriggers": "المحفّزات المكتشفة",
    "pdf.title": "الملخص الطبي الصحي",
    "pdf.subtitle": "أُنشئ لمراجعته مع فريق الرعاية الخاص بك",
    "pdf.patient": "المريض",
    "pdf.reportDate": "تاريخ التقرير",
    "pdf.reportingPeriod": "فترة التقرير",
    "pdf.periodRange": "من {start} إلى {end}",
    "pdf.executiveSummary": "1. الملخص التنفيذي",
    // Note: jsPDF's bidi engine reverses digit runs that directly follow an
    // opening paren in RTL text, so Arabic PDF strings avoid "(رقم" patterns.
    "pdf.avgPain": "متوسط الألم خلال 90 يومًا",
    // "≥" has no glyph in Amiri; spell the threshold out.
    "pdf.flareDays": "أيام الاشتعال (ألم 7 أو أكثر)",
    "pdf.primarySymptoms": "الأعراض الرئيسية",
    "pdf.entries": "عدد الإدخالات في الفترة",
    "pdf.briefTitle": "الملخص التنفيذي السريري الذكي لآخر 30 يومًا",
    "pdf.chartTitle": "2. اتجاه الألم لآخر 30 يومًا",
    "pdf.notEnoughData": "لا توجد بيانات كافية لرسم المخطط.",
    "pdf.correlationTitle": "3. ملخص الارتباطات",
    "pdf.correlationText": "أقوى علاقة تم العثور عليها في سجلاتك: {message}",
    "pdf.noCorrelation": "لم يتم رصد علاقات ذات دلالة إحصائية بين الأعراض والألم مع البيانات الحالية. واصل تسجيل الأعراض للحصول على ارتباطات أدق.",
    "pdf.insightsTitle": "4. الرؤى الصحية الرئيسية",
    "pdf.insightsEmpty": "سجّل ألمك وأعراضك لمدة 5 أيام على الأقل لإظهار رؤى مخصصة.",
    "pdf.annexTitle": "الملحق أ: سجل الإدخالات الكامل",
    "pdf.annexSubtitle": "الإدخالات الخام لعدد {count} من السجلات ضمن فترة التقرير.",
    "pdf.footer": "أُنشئ بواسطة فيبروكير · لأغراض إعلامية فقط، وليس تشخيصًا طبيًا.",
    "pdf.colDate": "التاريخ",
    "pdf.colPain": "الألم",
    "pdf.colMood": "المزاج",
    "pdf.colSymptoms": "الأعراض / الملاحظات",
    "pdf.avg7d": "متوسط 7 أيام",
    "pdf.na": "غير متوفر",
    "pdf.noMedsMentioned": "لم يُذكر أي دواء في السجلات",
    "careInsight.ariaLabel": "رؤية الرعاية الذكية",
    "careInsight.title": "رؤية الرعاية بالذكاء الاصطناعي",
    "careInsight.flareCalm": "هدوء",
    "careInsight.flareMild": "نوبة خفيفة",
    "careInsight.flareSevere": "نوبة شديدة",
    "careInsight.easing": "تتحسن",
    "careInsight.watch": "راقب",
    "careInsight.title.severeHeat": "يوم نوبة مع حرارة — لِنحمِ هدوءك",
    "careInsight.title.severe": "يوم نوبة — أبقِ دعمك قريبًا",
    "careInsight.title.mildHeat": "انزعاج خفيف مع حرارة — خطوات صغيرة تساعد",
    "careInsight.title.mild": "انزعاج خفيف — رعاية لطيفة تقطع شوطًا طويلًا",
    "careInsight.title.calmHeat": "يوم هادئ وطقس دافئ — حافظ على إيقاعك",
    "careInsight.title.calm": "يوم هادئ ومستقر — اعتني به",
    "careInsight.heat.severe": "يمكن للحرارة والالتهاب أن يجعلان ألم النوبة أصعب في التعامل معه. حافظ على برودة الغرفة وامنح جسمك راحة إضافية.",
    "careInsight.heat.mild": "يمكن للحرارة أن تضخّم الشعور بالألم عند مستواك. البقاء منتعشًا ورطبًا الآن يمكن أن يمنع الانزعاج من التصاعد.",
    "careInsight.heat.calm": "دفء اليوم معتدل بما يكفي لتبقى مرتاحًا — فقط أبقِ الماء قريبًا وتجنّب شمس منتصف النهار.",
    "careInsight.humidity.humidSevere": "يمكن للرطوبة العالية أن تضغط على المفاصل الحساسة. جهاز إزالة الرطوبة أو مروحة في مكانك يمكن أن يجعل الغرفة ألطف.",
    "careInsight.humidity.humid": "الهواء رطب اليوم، وهو ما قد يضيف شعورًا بالثقل. طبقات خفيفة وتدفق هواء يساعدان.",
    "careInsight.humidity.dry": "الهواء الجاف جدًا يمكن أن يهيّج البشرة والجيوب الأنفية. القليل الإضافي من الماء وجهاز ترطيب يحافظان على الراحة.",
    "careInsight.humidity.moderate": "الرطوبة ضمن نطاق مريح اليوم.",
    "careInsight.barometric.dropping": "الضغط الجوي ينخفض بسرعة، وهو ما قد يسبق أيام النوبات لدى الأجسام الحساسة.",
    "careInsight.barometric.low": "الضغط الجوي المنخفض قد يزيد حساسية الألم اليوم.",
    "careInsight.trend.rising": "كان ألمك يتصاعد بلطف هذا الأسبوع، لذا فإن تنظيم الجهد مهم اليوم أكثر من المعتاد.",
    "careInsight.trend.falling": "كان ألمك يتراجع خلال الأيام الأخيرة — لحظة جيدة لحركة خفيفة ومدروسة.",
    "careInsight.trend.stable": "كان ألمك مستقرًا هذا الأسبوع.",
    "careInsight.suggest.severe.1": "استرح في غرفة باردة منخفضة الإضاءة واقتصر النشاط على المهام الأساسية.",
    "careInsight.suggest.severe.2": "جرّب كمادة دافئة أو حماماً دافئاً لتخفيف تشنج العضلات واسترخائها، واشرب الماء بانتظام.",
    "careInsight.suggest.severe.3": "فعّل وضع التهدئة لمدة 3 دقائق من التنفس البطيء.",
    "careInsight.suggest.mild.1": "قم بنزهة قصيرة لطيفة أو تمطيط خفيف لتنشيط الدورة الدموية.",
    "careInsight.suggest.mild.2": "أبقِ الماء قريبًا ونظّم المهام مع استراحة قصيرة بينها.",
    "careInsight.suggest.mild.3": "لاحظ كيف يستجيب جسمك ليكون تسجيل الغد أسهل.",
    "careInsight.suggest.calm.1": "حافظ على روتينك اللطيف المعتاد وابقَ رطبًا.",
    "careInsight.suggest.calm.2": "اقضِ بضع دقائق هادئة في الخارج بينما يدعمك الطقس.",
    "careInsight.suggest.calm.3": "واصل التسجيل بانتظام — تصبح الأنماط أوضح كل يوم.",
    "insight.highPainAvg.title": "مستويات ألم مرتفعة",
    "insight.highPainAvg.message": "متوسط ألمك خلال آخر {days} يومًا هو {avg}/10، في النطاق المرتفع. فكّر في مناقشة خطتك الحالية مع فريق الرعاية.",
    "insight.lowPainAvg.title": "الألم مُدار بشكل جيد",
    "insight.lowPainAvg.message": "متوسط ألمك هو {avg}/10. ما تفعله يعمل — واصل عليه.",
    "insight.frequentFlares.title": "نوبات متكررة",
    "insight.frequentFlares.message": "سجّلت {count} أيام بمستوى نوبة (ألم ≥ 7) خلال آخر {days} يومًا. النوبات المتكررة قد تشير إلى الحاجة لمراجعة العلاج.",
    "insight.recurringFlares.title": "أيام نوبات متكررة",
    "insight.recurringFlares.message": "مرّت بك {count} أيام بمستوى نوبة مؤخرًا. غالبًا ما تتبع أنماط النوبات تغيّرات في النوم أو التوتر أو النشاط.",
    "insight.trendWorsening.title": "الألم في ارتفاع",
    "insight.trendWorsening.message": "ارتفع ألمك بمقدار {delta} نقطة بين النصف الأول والثاني من هذه الفترة.",
    "insight.trendImproving.title": "الألم في انخفاض",
    "insight.trendImproving.message": "انخفض ألمك بمقدار {delta} نقطة خلال هذه الفترة. واصل ما يساعدك.",
    "insight.weekdayPattern.title": "نمط أيام الأسبوع",
    "insight.weekdayPattern.message": "يميل {day} ليكون أكثر أيامك صعوبة (متوسط {avg}/10 عبر {count} سجلات). التخطيط لأعمال أخف في ذلك اليوم قد يساعد.",
    "insight.symptomCorrelation.positive.title": "تم رصد رابط بين الأعراض والألم",
    "insight.symptomCorrelation.positive.message": "الأيام التي فيها \"{symptom}\" يزيد الألم بمتوسط {delta} نقطة ({count} مرات). يستحق المتابعة عن قرب.",
    "insight.symptomCorrelation.negative.title": "أعراض تظهر في الأيام الأسهل",
    "insight.symptomCorrelation.negative.message": "يظهر \"{symptom}\" غالبًا في الأيام الأخف (ألم أقل بمقدار {delta} نقطة). قد يكون نتيجة وليس محفزًا.",
    "insight.lutealCognitive.title": "تأثير هرموني إدراكي",
    "insight.lutealCognitive.message": "يرتبط طورك الأصفري الحالي بارتفاع الأعراض الإدراكية (ضباب الدماغ/التركيز). هذا نمط هرموني شائع.",
    "insight.heatTherapy.title": "توصية راحة",
    "insight.heatTherapy.message": "رُصد ألم شديد في منطقتي الحوض وأسفل الظهر. قد يوفر العلاج الدافئ أو الرباط الضاغط بعض الراحة.",
    "chart.emptyTitle": "لا توجد إدخالات ألم خلال آخر 7 أيام.",
    "chart.emptyHint": "سجّل تسجيلك أعلاه لبدء تقدمك الأسبوعي.",
    "chart.legendPain": "مستوى الألم",
    "chart.legendAverage": "المتوسط الأسبوعي",
    "chart.summary": "الأعلى {max} من 10، والأدنى {min} من 10.",
    "chart.aria": "التقدم الأسبوعي للألم. {text}",
    "chart.painLevel": "/10",
    "chart.avgLabel": "متوسط {avg}",
    "recovery.sensory.title": "راحة حساسة",
    "recovery.sensory.on": "وضع الحساسية مفعّل: تعتيم الشاشة وإيقاف الحركة.",
    "recovery.sensory.off": "خفت الشاشة وأوقف الحركات للحظات.",
    "recovery.sensory.activate": "تفعيل وضع الحساسية",
    "recovery.sensory.deactivate": "إيقاف وضع الحساسية",
    "recovery.breath.title": "تنفس واعٍ",
    "recovery.breath.description": "جلسة تنفس موجهة من 3 دقائق لتخفيف التوتر.",
    "recovery.breath.openZen": "فتح بوابة الزن",
    "recovery.gratitude.title": "مذكرات الامتنان",
    "recovery.gratitude.description": "اضغط على لحظة أو اكتب لحظتك.",
    "recovery.gratitude.ariaLabel": "مطالبات امتنان سريعة",
    "recovery.gratitude.textareaLabel": "شيء أشعر بالامتنان له",
    "recovery.gratitude.placeholder": "شيء أشعر بالامتنان له...",
    "recovery.gratitude.saveEntry": "حفظ الإدخال",
    "recovery.gratitude.saved": "تم الحفظ ✓",
    "recovery.gratitude.chip1": "لحظة سلام",
    "recovery.gratitude.chip2": "نوم جيد",
    "recovery.gratitude.chip3": "شاي دافئ",
    "spoonTracker.title": "متتبع الملاعق",
    "spoonTracker.subtitle": "ميزانية الطاقة اليومية",
    "spoonTracker.undoAria": "التراجع عن آخر تغيير",
    "spoonTracker.aria": "{current} من {max} ملاعق متبقية",
    "spoonTracker.removeAria": "إزالة ملعقة",
    "spoonTracker.addAria": "إضافة ملعقة",
    "spoonTracker.preset.shower": "استحمام",
    "spoonTracker.preset.walk": "مشية قصيرة",
    "spoonTracker.preset.cooking": "طبخ",
    "spoonTracker.preset.groceries": "مشتريات",
    "spoonTracker.preset.rest": "راحة",
    "spoonTracker.preset.nap": "قيلولة",
    "bodyMap.title": "خريطة الألم",
    "bodyMap.front": "أمامي",
    "bodyMap.back": "خلفي",
    "bodyMap.mobility": "الحركة",
    "bodyMap.joints": "المفاصل",
    "bodyMap.muscles": "العضلات",
    "bodyMap.groups": "المجموعات",
    "bodyMap.subtitle": "اضغط على المناطق التي تشعر فيها بالألم",
    "bodyMap.emptyHint": "اضغط على منطقة في الجسم لتحديد الألم",
    "bodyMap.point.neck": "الرقبة",
    "bodyMap.point.shoulders": "الكتفان",
    "bodyMap.point.upperArms": "الذراعان العلويان",
    "bodyMap.point.lowerBack": "الظهر السفلي",
    "bodyMap.point.knees": "الركبتان",
    "bodyMap.point.occiput": "القفا",
    "bodyMap.point.lowCervical": "أسفل الرقبة",
    "bodyMap.point.trapezius": "شبه المنحرف",
    "bodyMap.point.supraspinatus": "فوق الشوكة",
    "bodyMap.point.secondRib": "الضلع الثاني",
    "bodyMap.point.epicondyle": "مرفق الكوع",
    "bodyMap.point.gluteal": "الألوية",
    "bodyMap.point.trochanter": "المدور الأكبر",
    "bodyMap.viewGroupAria": "عرض الجسم",
    "medication.title": "أدوية اليوم",
    "medication.subtitle": "تتبع جرعاتك",
    "medication.morningSupplement": "مكمل الصباح",
    "medication.painRelief": "مسكن الألم",
    "medication.eveningMag": "مغنيسيوم المساء",
    "medication.taken": "تم تناوله",
    "medication.pending": "معلق",
    "medication.nextDose": "الجرعة القادمة خلال",
    "zen.focusBreath": "ركّز على تنفسك",
    "zen.ultraDark": "داكن جدًا",
    "zen.exitUltraDark": "الخروج من الوضع الداكن",
    "zen.switchCalming": "التبديل إلى وضع الهدوء",
    "zen.breatheIn": "شهيق ({seconds}ث)",
    "zen.breatheOut": "زفير ({seconds}ث)",
    "zen.soundscapeAria": "خلاط الأصوات المحيطة",
    "zen.sound.rain.label": "مطر",
    "zen.sound.rain.description": "مطر ناعم يتساقط",
    "zen.sound.forest.label": "غابة",
    "zen.sound.forest.description": "أجواء غابة عميقة",
    "zen.sound.whiteNoise.label": "ضوضاء بيضاء",
    "zen.sound.whiteNoise.description": "همهمة ثابتة",
    "zen.sound.deepHum.label": "طنين عميق",
    "zen.sound.deepHum.description": "نغمة أرضية منخفضة",
    "zen.pause": "إيقاف مؤقت",
    "zen.resume": "استئناف",
    "zen.pausedAria": "تم إيقاف التنفس مؤقتًا",
    "zen.volumeAria": "مستوى الصوت المحيط",
    "zen.shortcutHint": "مسافة للإيقاف المؤقت \u00b7 Esc للخروج",
    "narration.title": "أنماطك، بكلمات بسيطة",
    "narration.explain": "اشرح لي هذا",
    "narration.stop": "إيقاف",
    "narration.dismiss": "إغلاق",
    "narration.generatingAria": "جارٍ إنشاء الشرح",
    "narration.offline": "الشرح المخصص يحتاج مفتاح ذكاء اصطناعي مباشر. رؤىك المبنية على البيانات أعلاه تقول الكثير — أضف GEMINI_API_KEY إلى الخادم لفتحه.",
    "narration.detailedAnalysisTitle": "تحليل الأنماط التفصيلي",
    "narration.detailedAnalysisDesc": "رؤى أكثر تفصيلاً بناءً على سجلاتك الصحية",
    "narration.patternBody": "تظهر أنماطك وجود ارتباط قوي بين جودة النوم ومستويات الألم في الصباح التالي.",
    "narration.aiObservationLabel": "ملاحظة الذكاء الاصطناعي",
    "narration.aiObservationText": "عادة ما تحدث نوبات الألم بعد ‎24-48‎ ساعة من الفترات عالية التوتر.",
    "narration.missingLogsFallback": "سجّل الألم والأعراض لمدة 5 أيام على الأقل لفتح شرح مخصص لأنماطك.",
    "reflection.button": "تأمل مع الذكاء الاصطناعي",
    "reflection.stop": "إيقاف التأمل",
    "reflection.generatingAria": "جارٍ التأمل في ملاحظتك",
    "reflection.resultLabel": "تأمل لطيف",
    "reflection.dismissAria": "إغلاق التأمل",
    "reflection.offline": "تأمل الذكاء الاصطناعي يحتاج مفتاحًا مباشرًا — ملاحظتك محفوظة وتبقى خاصة على هذا الجهاز.",
    "companion.openAria": "فتح رفيق الرعاية الذكي",
    "companion.dialogAria": "محادثة رفيق الرعاية الذكي",
    "companion.title": "رفيق الرعاية الذكي",
    "companion.waking": "جارٍ الاستيقاظ…",
    "companion.offlineBadge": "غير متصل · أضف مفتاح ذكاء اصطناعي للدردشة المباشرة",
    "companion.liveSimulated": "مباشر · محاكاة ({provider})",
    "companion.liveRag": "مباشر · RAG Active",
    "companion.retrieving": "جاري البحث في المراجع الطبية وتجميع البيانات...",
    "companion.closeAria": "إغلاق الدردشة",
    "companion.hello": "أنا هنا معك. اسألني أي شيء عن إدارة التهاب العضلات الليفية يومًا بيوم — أنا أعرف سجلاتك الأخيرة بالفعل.",
    "companion.suggestion1": "ما الذي يساعد أكثر أثناء النوبة؟",
    "companion.suggestion2": "هل توجد أنماط في سجلاتي هذا الأسبوع؟",
    "companion.suggestion3": "ساعدني في تخطيط يوم لطيف ومنخفض الطاقة",
    "companion.offlinePaused": "الدردشة متوقفة بينما الذكاء الاصطناعي غير متصل.",
    "companion.chatFormAria": "الدردشة مع الرفيق الذكي",
    "companion.inputLabel": "أرسل رسالة لرفيق الرعاية الذكي",
    "companion.inputPlaceholder": "كيف تشعر الآن؟",
    "companion.checkedData": "تم فحص أحدث بياناتك",
    "companion.errorRetry": "حاول مجددًا",
    "companion.errorDefault": "حدث خطأ ما. حاول مرة أخرى.",
    "companion.authRequired": "انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.",
    "companion.authExpiredBanner": "انتهت جلسة الدردشة. سجّل الدخول مرة أخرى لمتابعة محادثتك.",
    "companion.authSignIn": "تسجيل الدخول مرة أخرى",
    "companion.responding": "الرفيق يرد.",
    "companion.sendAria": "إرسال الرسالة",
    "companion.stopAria": "إيقاف التوليد",
    "companion.offlineHint": "الرفيق يستريح. أضف GEMINI_API_KEY (أو مفتاح موفر آخر) في بيئة الخادم لإيقاظه.",
    "companion.mockHint": "وضع المحاكاة مفعّل — الردود محاكاة محليًا. أضف مفتاح GEMINI_API_KEY حقيقي وأعد تشغيل خادم التطوير للحصول على ذكاء اصطناعي مباشر.",
    "logs.pageTitle": "سجلات الصحة",
    "logs.pageSubtitle": "راجع سجل تسجيلاتك وقم بتصفيته وإدارته.",
    "logs.summaryAria": "ملخص السجل",
    "logs.stat.totalEntries": "إجمالي الإدخالات",
    "logs.stat.avgPain": "متوسط الألم",
    "logs.stat.flareDays": "أيام النوبة",
    "logs.stat.totalHint": "تسجيل محسوب",
    "logs.stat.avgHint": "عبر جميع الإدخالات",
    "logs.stat.flareHint": "مستوى ألم 7+",
    "logs.empty.title": "لا توجد سجلات",
    "logs.empty.description": "ابدأ بتتبع مستويات ألمك في لوحة التحكم وستظهر سجلاتك هنا.",
    "logs.empty.cta": "الانتقال إلى لوحة التحكم",
    "logs.tableTitle": "سجل الألم",
    "logs.showing": "عرض {shown} من {total} إدخالات.",
    "logs.searchPlaceholder": "ابحث عن مزاج أو ملاحظات",
    "logs.searchAria": "البحث في السجلات حسب المزاج أو الملاحظات",
    "logs.clearAria": "مسح البحث",
    "logs.filterLabel": "تصفية حسب شدة الألم",
    "logs.col.date": "التاريخ",
    "logs.col.pain": "مستوى الألم",
    "logs.col.mood": "المزاج",
    "logs.col.notes": "الملاحظات",
    "logs.col.action": "إجراء",
    "logs.noMatch.title": "لا توجد سجلات مطابقة",
    "logs.noMatch.description": "جرب شدة مختلفة أو امسح بحثك.",
    "logs.clearFilters": "مسح عوامل التصفية",
    "logs.noNotes": "بدون ملاحظات",
    "logs.confirm": "تأكيد؟",
    "logs.confirmDeleteAria": "تأكيد حذف السجل من {date}",
    "logs.deleteAria": "حذف السجل من {date}",
    "logs.severity.all": "الكل",
    "logs.severity.low": "خفيف",
    "logs.severity.moderate": "متوسط",
    "logs.severity.severe": "شديد",
    "logs.painAria": "مستوى الألم {level}",
    "profile.pageTitle": "الملف الشخصي",
    "profile.pageSubtitle": "أدر تفاصيل حسابك وتابع تقدمك.",
    "profile.loading": "جارٍ تحميل الملف الشخصي...",
    "profile.streakLabel": "السلسلة",
    "profile.days": "{count} أيام",
    "profile.totalLogsLabel": "إجمالي السجلات",
    "profile.accountTitle": "إعدادات الحساب",
    "profile.accountDescription": "خصص كيفية ظهور اسمك في التطبيق.",
    "profile.displayNameLabel": "الاسم المعروض",
    "profile.displayNamePlaceholder": "اسمك",
    "profile.saving": "جارٍ الحفظ...",
    "profile.saveChanges": "حفظ التغييرات",
    "profile.nameUpdated": "تم تحديث الاسم بنجاح!",
    "profile.updateFailed": "فشل تحديث الملف الشخصي",
    "profile.updateError": "حدث خطأ ما أثناء حفظ ملفك الشخصي.",
    "profile.motionTitle": "الحركة والراحة",
    "profile.motionDescription": "قلل أو عطّل الحركة على الشاشة إذا كانت مرهقة.",
    "profile.gentleMotion": "حركة لطيفة",
    "profile.motionOn": "البطاقات تطفو وتنحني وتتحرك بلطف أثناء تفاعلك.",
    "profile.motionOff": "الحركة متوقفة لتجربة أهدأ وأكثر ثباتًا.",
    "profile.biometricTitle": "الفتح بالبصمة",
    "profile.biometricEnable": "تمكين الفتح بالبصمة",
    "profile.biometricEnabled": "تم تمكين الفتح بالبصمة.",
    "profile.biometricDisable": "تعطيل الفتح بالبصمة",
    "profile.biometricUnsupported": "الفتح بالبصمة غير مدعوم على هذا الجهاز أو المتصفح.",
    "video.tab": "فيديو موجّه",
    "video.loading": "جارٍ تحميل الدليل…",
    "video.badge": "دليل",
    "video.openExternal": "افتح الفيديو الموجّه في تبويب جديد",
    "video.unavailable": "الفيديو الموجّه غير متاح الآن — إليك الخطوات بدلًا منه.",
    "dashboard.section.today": "اليوم",
    "dashboard.section.core": "الأدوات الأساسية",
    "dashboard.section.pro": "الأطباء والاستشارات",
    "dashboard.pro.title": "مركز الأطباء والاستشارات الطبية",
    "dashboard.pro.subtitle": "محتوى طبي موثوق من أطباء موثقين واستشارات مباشرة.",
    "dashboard.pro.doctorFeed": "آخر من الأطباء",
    "dashboard.pro.symptomHelper": "المساعد الذكي للأعراض",
    "dashboard.pro.viewAll": "عرض الكل",
    "dashboard.pro.browseDoctors": "تصفح مقالات الأطباء",
    "dashboard.pro.startConsultation": "بدء استشارة أو شات مع طبيب",
    "dashboard.pro.badgeText": "Pro",
    "dashboard.section.insights": "الرؤى والدعم الهادئ",
    "dashboard.section.health": "متابعة الصحة والرؤى",
    "dashboard.toolkitCard.title": "حقيبة العناية والتمرين",
    "dashboard.toolkitCard.desc": "تمارين لطيفة تناسب طاقة اليوم، وصوت مهدّئ دون اتصال، وأدلة تنفس، والنوم وHRV، وسلامة الأدوية.",
    "dashboard.toolkitCard.cta": "فتح حقيبة العناية والتمارين",
    "toolkit.title": "حقيبة العناية",
    "toolkit.subtitle": "حركة ونوم وسلامة الأدوية ورؤى المجتمع — كلها تعمل دون اتصال.",
    "medications.title": "الأدوية والسلامة",
    "medications.subtitle": "تابع أدويتك وافحصها من التداخلات الشائعة في الفيبروميالغيا.",
    "medications.namePlaceholder": "دواء أو مكمّل",
    "medications.dosePlaceholder": "الجرعة",
    "medications.timingLabel": "التوقيت",
    "medications.timing.morning": "صباحًا",
    "medications.timing.evening": "مساءً",
    "medications.timing.bedtime": "قبل النوم",
    "medications.add": "إضافة",
    "medications.remove": "إزالة",
    "medications.empty": "لم تُضف أدوية بعد — ابدأ بإضافة دواء أدناه.",
    "medications.alerts": "تنبيهات التداخل",
    "medications.severity.critical": "خطير",
    "medications.severity.warning": "تحذير",
    "medications.severity.caution": "احتراس",
    "medications.defaultDose": "حسب الوصفة",
    "medications.disclaimer": "أداة فحص أولي فقط — أكّد التداخلات دائمًا مع طبيبك أو الصيدلي.",
    "somatic.title": "أدوات الحركة والنوبات الحادة",
    "somatic.subtitle": "تمارين جسدية وصوت مهدّئ وتنفّس — بما يناسب ميزانية الطاقة اليوم.",
    "somatic.painToday": "الألم اليوم",
    "somatic.spoonsLeft": "الملاعق المتبقية",
    "somatic.start": "ابدأ",
    "somatic.stop": "إيقاف",
    "somatic.noneSuitable": "الراحة هي التمرين اليوم — لا شيء يناسب هذا المستوى من الألم.",
    "somatic.ex.breathing.title": "التنفس الحجابي",
    "somatic.ex.breathing.desc": "تنفس بطيء من البطن لتهدئة الجهاز العصبي.",
    "somatic.ex.humming.title": "الطنين العصب الحائر",
    "somatic.ex.humming.desc": "طنين لطيف لتحفيز العصب الحائر.",
    "somatic.ex.eyes.title": "تهدئة حركة العين",
    "somatic.ex.eyes.desc": "نظرات جانبية بطيئة لخفض التوتر.",
    "somatic.ex.neck.title": "تفريغات الرقبة الدقيقة",
    "somatic.ex.neck.desc": "حركات رقبة صغيرة بلا ألم وبإيقاعك.",
    "somatic.ex.shoulders.title": "دوائر الكتفين",
    "somatic.ex.shoulders.desc": "دوائر صغيرة بطيئة لتفكيك شد الكتف.",
    "somatic.ex.catcow.title": "القط والبقرة",
    "somatic.ex.catcow.desc": "دورات ثني العمود الفقري ضمن الراحة فقط.",
    "somatic.ex.legs.title": "الساقان على الحائط",
    "somatic.ex.legs.desc": "وضعية استشفائية للاسترخاء والتهدئة.",
    "somatic.ex.bodyscan.title": "مسح الجسد الموجّه",
    "somatic.ex.bodyscan.desc": "انتباه متدرج من الرأس إلى القدمين.",
    "somatic.audio.title": "صوت طوارئ النوبات",
    "somatic.audio.binaural432": "نغمات ثنائية 432 هرتز",
    "somatic.audio.binaural528": "نغمات ثنائية 528 هرتز",
    "somatic.audio.brown": "ضجيج بني عميق",
    "somatic.audio.headphonesNote": "استخدم سماعات الرأس للنغمات الثنائية. يعمل دون اتصال تمامًا.",
    "somatic.breathing.title": "تنفس 4-7-8",
    "somatic.breathing.inhale": "شهيق",
    "somatic.breathing.hold": "حبس",
    "somatic.breathing.exhale": "زفير",
    "somatic.breathing.idle": "جاهز متى شئت",
    "somatic.breathing.idleHint": "اضغط ابدأ للانطلاق",
    "somatic.breathing.cycle": "دورة",
    "postMeal.title": "إرهاق ما بعد الوجبة",
    "postMeal.subtitle": "تتبع تأثير الوجبات على طاقتك",
    "postMeal.mealLabel": "نوع الوجبة",
    "postMeal.fatigueLabel": "مستوى الإرهاق",
    "postMeal.log": "تسجيل إرهاق الوجبة",
    "postMeal.saved": "تم التسجيل!",
    "postMeal.recent": "السجلات الأخيرة",
    "postMeal.undoAria": "التراجع عن آخر إدخال",
    "postMeal.meal.breakfast": "فطور",
    "postMeal.meal.lunch": "غداء",
    "postMeal.meal.dinner": "عشاء",
    "postMeal.meal.snack": "وجبة خفيفة",
    "postMeal.fatigue.none": "لا إرهاق",
    "postMeal.fatigue.mild": "خفيف",
    "postMeal.fatigue.moderate": "متوسط",
    "postMeal.fatigue.high": "شديد",
    "postMeal.fatigue.severe": "حاد",
    "rescue.title": "توصية الإنقاذ الذكية",
    "rescue.subtitle": "نصيحة هادئة بفعل واحد، مصمّمة حسب ألمك وطاقتك وطقس اليوم.",
    "rescue.generate": "توليد التوصية",
    "rescue.regenerate": "جرّب نصيحة أخرى",
    "rescue.context.pain": "الألم",
    "rescue.context.spoons": "الملاعق المتبقية",
    "rescue.context.weather": "الطقس",
    "rescue.context.estimate": "تقدير دون اتصال",
    "rescue.spoonsLabel": "الملاعق المتبقية",
    "rescue.tip.flare.1": "هذه اللحظة موجة لا حكم — الاشتعال يملك الساعة القادمة، لا اليوم كله.",
    "rescue.tip.flare.2": "جسدك يطلب سرعة أقل الآن؛ أجب عنه بلطف صغير واحد.",
    "rescue.tip.weather.1": "الضغط والرطوبة يشدّانك اليوم — أبقِ الحمل خفيفًا وثابتًا.",
    "rescue.tip.weather.2": "الطقس يعمل ضدك اليوم؛ مهمتك الوحيدة حماية طاقتك.",
    "rescue.tip.moderate.1": "الطاقة موجودة لكنها ليست متدفقة — احمِ ساعتك الأفضل لما يهم.",
    "rescue.tip.moderate.2": "لديك مجال للحركة اليوم، لكن فقط بوتيرة يعرفها جسدك مسبقًا.",
    "rescue.tip.lowSpoons.1": "الملاعق على وشك النفاد — ألطف فعل الآن هو السكون، لا الإنجاز.",
    "rescue.tip.lowSpoons.2": "بطاقة قليلة متبقية؛ اختر راحة صغيرة واحدة بدل أي مهمة.",
    "rescue.tip.calm.1": "الأجواء هادئة — اقضِ كتلة تركيز واحدة، ثم استرح قبل أن تحتاج.",
    "rescue.tip.calm.2": "طقس اليوم في صفّك؛ أبقِ المجهود لطيفًا ومتسقًا.",
    "rescue.action.flare.1": "استلقِ مع كمادة دافئة لمدة 10 دقائق",
    "rescue.action.flare.2": "اشرب الماء ببطء ونفّذ تنفس 4-7-8 مرة واحدة",
    "rescue.action.weather.1": "تمشَّ ببطء في الخارج لمدة 15 دقيقة",
    "rescue.action.weather.2": "قم بجلسة تمدد لطيفة لمدة 10 دقائق",
    "rescue.action.moderate.1": "أنجز مهمة تركيز واحدة ثم توقف",
    "rescue.action.moderate.2": "امشِ بوتيرة مريحة لمدة 20 دقيقة",
    "rescue.action.lowSpoons.1": "استرح في غرفة هادئة ومظلمة لمدة 10 دقائق",
    "rescue.action.lowSpoons.2": "اجلس وخذ ثلاثة أنفاس بطيئة، لا شيء آخر",
    "rescue.action.calm.1": "عالج مهمة تركيز واحدة في كتلة واحدة",
    "rescue.action.calm.2": "امشِ بوتيرة مريحة لمدة 20 دقيقة",
    "rescue.why.flare.1": "الألم الشديد يستجيب أفضل للمحفزات المنخفضة والدفء اللطيف.",
    "rescue.why.flare.2": "التنفس البطيء يخفف استجابة التوتر التي تضخّم الألم.",
    "rescue.why.weather.1": "الحركة اللطيفة في ساعتك الأفضل تحافظ على الوتيرة دون رفع خطر الاشتعال.",
    "rescue.why.weather.2": "التمدد يخفف التيبّس الذي يتبع تغيّرات الضغط والرطوبة.",
    "rescue.why.moderate.1": "كتلة تركيز واحدة تصرف الطاقة بينما هي متوفرة.",
    "rescue.why.moderate.2": "الوتيرة الثابتة تحافظ على استمراريتك دون استلاف من الغد.",
    "rescue.why.lowSpoons.1": "الراحة هي أسرع طريقة لإعادة بناء ملعقة في هذه الساعة.",
    "rescue.why.lowSpoons.2": "التنفس يعيد ضبط الجهاز العصبي دون صرف طاقة.",
    "rescue.why.calm.1": "كتلة واحدة تستغل نافذة الطاقة اليوم قبل تغيّر الطقس.",
    "rescue.why.calm.2": "المجهود اللطيف المتسق يحميك عبر اليوم كله.",
    "sleep.title": "بنية النوم ومتغير معدل ضربات القلب",
    "sleep.subtitle": "فحص أنماط النوم غير الاستشفائي والتخطيط حول ضباب الفيبرو.",
    "sleep.hours": "ساعات النوم",
    "sleep.awakenings": "مرات الاستيقاظ",
    "sleep.restLabel": "ما مدى شعورك بالراحة؟",
    "sleep.rest.1": "منهك",
    "sleep.rest.2": "راحة سيئة",
    "sleep.rest.3": "لا بأس",
    "sleep.rest.4": "راحة جيدة",
    "sleep.rest.5": "منتعش تمامًا",
    "sleep.syncWearable": "مزامنة الساعة الذكية",
    "sleep.deep": "النوم العميق",
    "sleep.hrv": "HRV",
    "sleep.restingHr": "نبض الراحة",
    "sleep.alphaDelta": "فحص تسلل ألفا-دلتا",
    "sleep.alphaDelta.likely": "النمط محتمل — يبدو النوم غير استشفائي",
    "sleep.alphaDelta.possible": "نمط ممكن — واصل التتبع",
    "sleep.alphaDelta.unlikely": "النمط غير محتمل",
    "sleep.alphaDelta.insufficient-data": "لا تتوفر بيانات كافية بعد",
    "sleep.deepStatus": "النوم العميق",
    "sleep.deep.low": "منخفض",
    "sleep.deep.normal": "طبيعي",
    "sleep.deep.high": "مرتفع",
    "sleep.deep.unknown": "غير معروف",
    "sleep.fogRisk": "خطر ضباب الفيبرو اليوم",
    "sleep.fogLevel.low": "منخفض",
    "sleep.fogLevel.moderate": "متوسط",
    "sleep.fogLevel.high": "مرتفع",
    "sleep.fogGuidance.low": "خطر الضباب منخفض — يوم مناسب للمهام التي تتطلب تركيزًا؛ ومع ذلك حافظ على وتيرتك واحمِ نوم الليلة.",
    "sleep.fogGuidance.moderate": "خطر ضباب متوسط — أنجز المهام التي تتطلب تركيزاً في ساعاتك الأفضل، وخذ قسطاً من الراحة ظهراً",
    "sleep.fogGuidance.high": "خطر ضباب مرتفع اليوم — عامل التفكير كملعقة: ركّز على مهمة واحدة، واستخدم الملاحظات والتذكيرات، وأجّل القرارات التي يمكن أن تنتظر، واحمِ قسط راحة 20 دقيقة قبل الانهيار.",
    "sleep.disclaimer": "فحص تتبع ذاتي فقط — ليس دراسة نوم؛ ناقش المشكلات المستمرة مع فريقك الطبي.",
    "communityInsights.title": "رؤى المجتمع",
    "communityInsights.subtitle": "اتجاهات مجهولة الهوية على مستوى المنطقة من مجتمع FibroCare.",
    "communityInsights.region": "المنطقة",
    "communityInsights.trendLead": "{pct}% من المستخدمين في {region} يبلّغون عن ازدياد حساسية الاشتعال الآن",
    "communityInsights.dominantTrigger": "المحفّز السائد",
    "communityInsights.barometric.falling": "الضغط ينخفض",
    "communityInsights.barometric.steady": "الضغط مستقر",
    "communityInsights.barometric.rising": "الضغط يرتفع",
    "communityInsights.reportingUsers": "{count} مستخدمًا يبلّغون",
    "communityInsights.leaderboard": "أفضل استراتيجيات التأقلم (بتصويت المجتمع)",
    "communityInsights.votes": "{count} صوتًا",
    "communityInsights.disclaimer": "تجميعات مجهولة الهوية نموذجية — لا تُعرض أي بيانات فردية أبدًا.",
    "triggers.barometricDrop": "انخفاض الضغط الجوي",
    "triggers.humidity": "الرطوبة",
    "triggers.poorSleep": "سوء النوم",
    "triggers.overexertion": "الإجهاد المفرط",
    "triggers.stress": "التوتر",
    "coping.pacedBreathing": "التنفس المُتدرّج",
    "coping.warmWaterTherapy": "العلاج بالماء الدافئ",
    "coping.gradedWalking": "المشي المتدرج",
    "coping.sleepHygiene": "روتين نظافة النوم",
    "coping.mindfulness": "ممارسة اليقظة الذهنية",
    "coping.heatTherapy": "العلاج بالحرارة",
    "coping.taiChi": "تاي تشي",
    "profile.motionToggleAria": "تبديل الحركة اللطيفة",
    "profile.privacyTitle": "قفل الخصوصية",
    "profile.privacyDescOn": "رمز PIN من 4 أرقام يحمي سجلاتك. يقفل التطبيق تلقائيًا عند مغادرة التبويب.",
    "profile.privacyDescOff": "احمِ بياناتك الصحية الحساسة برمز PIN من 4 أرقام.",
    "profile.newPinLabel": "رمز PIN جديد من 4 أرقام",
    "profile.enableLock": "تفعيل القفل",
    "profile.changePinLabel": "تغيير رمز PIN",
    "profile.changePinPlaceholder": "رمز PIN جديد من 4 أرقام",
    "profile.update": "تحديث",
    "profile.disableLock": "إيقاف القفل",
    "profile.lockNow": "قفل الآن",
    "profile.signinTitle": "تسجيل الدخول للحساب",
    "profile.signinDescription": "سجّل الدخول بمزود اجتماعي للوصول إلى فيبروكير عبر الأجهزة.",
    "profile.signedInAs": "سجّلت الدخول باسم {name}",
    "profile.signOut": "تسجيل الخروج",
    "profile.signInGoogle": "تسجيل الدخول مع Google",
    "profile.signInGithub": "تسجيل الدخول مع GitHub",
    "landing.openMenu": "فتح القائمة",
    "landing.closeMenu": "إغلاق القائمة",
    "landing.signIn": "تسجيل الدخول",
    "landing.start": "ابدأ تسجيلك اليومي",
    "landing.benefits.pill.core": "الأساس",
    "landing.benefits.pill.new": "جديد",
    "landing.resources.eyebrow": "من المكتبة",
    "landing.resources.heading": "أدلة للأيام التي تتخلل النوبات.",
    "landing.resources.viewAll": "عرض جميع الموارد",
    "landing.resources.card.category.basics": "الأساسيات",
    "landing.resources.card.category.diagnosis": "التشخيص",
    "landing.resources.card.category.treatment": "العلاج",
    "landing.resources.card.category.movement": "الحركة",
    "landing.resources.card.category.nutrition": "التغذية",
    "landing.resources.card.category.faq": "الأسئلة الشائعة",
    "landing.resources.card.readGuide": "اقرأ الدليل",
    "landing.nav.how": "كيف يعمل",
    "landing.nav.features": "ما الذي تحصل عليه",
    "landing.nav.stories": "قصص",
    "landing.nav.faq": "الأسئلة الشائعة",
    "landing.hero.badge": "صُمِّم للحياة مع الفيبروميالجيا",
    "landing.hero.heading": "ألمُك حقيقي. وإيقاعُك ملكُك.",
    "landing.hero.subheading": "تسجيلات يومية تحوّل الأعراض الخفية إلى أنماط واضحة، وأيام أكثر هدوءًا، وتقارير يفيد بها فريق رعايتك فعلًا.",
    "landing.hero.seeHow": "شاهد كيف يعمل",
    "landing.hero.checkinTitle": "تسجيل اليوم",
    "landing.hero.done": "تم",
    "landing.hero.pain": "الألم",
    "landing.hero.energy": "الطاقة",
    "landing.hero.sleep": "النوم",
    "landing.hero.gentle": "خفيف",
    "landing.hero.low": "منخفض",
    "landing.hero.sleepValue": "6س",
    "landing.hero.daily": "تسجيل يومي",
    "landing.hero.pdf": "تقرير PDF",
    "landing.hero.doctorReady": "جاهز للطبيب",
    "landing.hero.minutes": "دقيقتان",
    "landing.hero.mockupSub": "دقيقتان، تُسجَّلان بلطف.",
    "landing.hero.freeStart": "ابدأ مجانًا",
    "landing.hero.noCard": "بدون بطاقة ائتمان",
    "landing.hero.private": "خصوصيتك مصانة",
    "landing.trust.encrypted": "مشفّر ولا يُشارك أبدًا",
    "landing.trust.label": "التزامات الثقة والخصوصية",
    "landing.tagline.eyebrow": "الجزء الهادئ",
    "landing.tagline.heading": "جسدُك يسجِّل ما يتعرض له. فيبروكير يساعدك على قراءته.",
    "landing.tagline.copy": "تجربة الأشخاص المصابين بالفيبروميالجيا لا تُصدَّق بما يكفي: من الأطباء، ومن أماكن العمل، وأحيانًا من أنفسهم. فيبروكير يبدأ من الجهة المعاكسة: تجربتك هي البيانات.",
    "landing.day.title": "يوم مع الفيبروميالجيا",
    "landing.day.rail": "يوم مع الفيبروميالجيا",
    "landing.day.scenes": "{count} مشاهد",
    "landing.day.morning": "صباحًا",
    "landing.day.midday": "منتصف النهار",
    "landing.day.evening": "مساءً",
    "landing.day.night": "ليلًا",
    "landing.day.morningHeadline": "تستيقظ وقد استنفدت طاقتك.",
    "landing.day.morningCopy": "ينطلق المنبه، لكن جسدك لم يبلغه التنبيه. الثقل موجود قبل أن تلمس قدماك الأرض، وهو ليس كسلًا.",
    "landing.day.middayHeadline": "يُطبِق الضباب.",
    "landing.day.middayCopy": "تتبعثر الكلمات. أبسط مهمة تكلفك ضعف الجهد. تتعلم أن تتريّث في منتصف اليوم، مُبقِيًا أخف المهام لأشد الساعات ضبابًا.",
    "landing.day.eveningHeadline": "تأتي النوبة دون دعوة.",
    "landing.day.eveningCopy": "يتحرك الألم دون جدول أعمال: الكتفان، والوركان، واليدان. تتنفس بهدوء وتريّث، لأنك تعلم أن هذا سيمرّ أيضًا.",
    "landing.day.nightHeadline": "لقد اجتزت اليوم.",
    "landing.day.nightCopy": "يوم آخر سُجِّل، وخيط آخر من النمط. الليلة لا تقاتل نومًا لا تملكه. ترتاح.",
    "landing.benefits.heading": "مصمَّم لواقع العيش معه.",
    "landing.benefits.copy": "ليس مجرد متتبع آخر لمن يشعرون بحالة جيدة. فيبروكير مبني حول الأيام التي لا يكون فيها «جيد» على القائمة.",
    "landing.benefits.checkinsTitle": "تسجيلات من دقيقتين",
    "landing.benefits.checkinsCopy": "الألم والطاقة والنوم والمزاج: تُسجَّل على أشرطة لطيفة في أقل من دقيقتين، فلا يصبح التسجيل عبئًا إضافيًا في يوم صعب.",
    "landing.benefits.patternsTitle": "أنماط تراها أخيرًا",
    "landing.benefits.patternsCopy": "تربط الرؤى نوباتك بالنوم والطقس والإيقاع، فتحوّل «لماذا أنا؟» إلى «ما الذي أستطيع التحكم به».",
    "landing.benefits.reportTitle": "تقرير يمكن لطبيبك قراءته",
    "landing.benefits.reportCopy": "ملخص PDF نظيف بنقرة واحدة لاتجاهاتك، فيبدأ موعدك من أدلتك لا من ذاكرتك.",
    "landing.benefits.toolsTitle": "أدوات للأيام الحسّاسة",
    "landing.benefits.toolsCopy": "تمارين التنفس، ومقاطع صوتية، ومذكرة امتنان على بُعد نقرة واحدة داخل بوابة الزين: هدوء عندما تحتاجه أكثر.",
    "landing.benefits.privacyTitle": "خصوصية بالتصميم",
    "landing.benefits.privacyCopy": "قفل PIN اختياري ووضع حسي يخفّف الألوان والحركة. بياناتك مشفَّرة ولا تُباع أبدًا.",
    "landing.benefits.readyTitle": "جاهز متى كنتَ.",
    "landing.benefits.readyCopy": "لا ضغط لتصبح منتظمًا قبل أن ينجح. فيبروكير يقابلك أينما حلّ يومك.",
    "landing.how.heading": "ثلاثة أمور صغيرة، بكل لطف.",
    "landing.how.step1Title": "سجّل يوميًا",
    "landing.how.step1Copy": "دقيقتان على أشرطة لطيفة: الألم، والطاقة، والنوم، والمزاج. لا نماذج، لا ضغط، لا أحكام.",
    "landing.how.step2Title": "لاحظ النمط",
    "landing.how.step2Copy": "يربط فيبروكير الخيوط عبر تسجيلاتك، فتتوقف النوبات عن أن تبدو عشوائية وتبدأ في الظهور كشيء يمكنك التخطيط حوله.",
    "landing.how.step3Title": "شارك ما يهم",
    "landing.how.step3Copy": "احضر بملخص PDF واضح بنقرة واحدة إلى موعدك القادم: أدلتك، في شكل يستخدمه فريق رعايتك.",
    "landing.testimonials.heading": "بكلماتهم.",
    "landing.testimonials.copy": "تسجيلات حقيقية، أنماط حقيقية، محادثات حقيقية مع فرق الرعاية.",
    "landing.testimonials.q1": "لأول مرة، رأى طبيبي ألمي بوصفه نمطًا لا لغزًا. دخلت ذاك الموعد بأشهر من الأدلة.",
    "landing.testimonials.q2": "التسجيلات القصيرة هي تطبيق الصحة الوحيد الذي واظبتُ عليه. لا يجعلني أشعر بالذنب في الأيام الصعبة.",
    "landing.testimonials.q3": "أخذُ تقرير PDF إلى طبيبة الروماتيزم غيّر المحادثة كلّها. تحدثنا أخيرًا عن الاتجاهات، لا عن الحكايات.",
    "landing.testimonials.amiraName": "أميرة ح.",
    "landing.testimonials.amiraRole": "تعيش مع الفيبروميالجيا منذ 2019",
    "landing.testimonials.nourName": "نور س.",
    "landing.testimonials.nourRole": "معلمة في مدرسة ابتدائية",
    "landing.testimonials.monaName": "منى ك.",
    "landing.testimonials.monaRole": "مصممة، شُخِّصت عام 2021",
    "landing.faq.heading": "أسئلة تُجاب بلطف.",
    "landing.faq.copy": "إذا كانت لديك أسئلة أخرى، فمكتبة الموارد تحتوي على أدلة أعمق حول الأعراض والعلاج والحياة اليومية مع الفيبروميالجيا.",
    "landing.faq.resources": "استكشف الموارد",
    "landing.faq.q1": "هل فيبروكير تشخيص أم طبيب؟",
    "landing.faq.a1": "لا. فيبروكير رفيق لتتبع تجربتك اليومية وفهمها. لا يشخّص ولا يعالج ولا يستبدل الرعاية الطبية. يساعدك على الوصول إلى فريق رعايتك بمعلومات أوضح.",
    "landing.faq.q2": "كم يستغرق التسجيل؟",
    "landing.faq.a2": "حوالي دقيقتين. تُحرّك أشرطة لطيفة للألم والطاقة والنوم والمزاج. لا توجد حقول نصية تملؤها إلا إذا أردت إضافة ملاحظة.",
    "landing.faq.q3": "هل تبقى بياناتي الصحية خاصة؟",
    "landing.faq.a3": "نعم. بياناتك مشفَّرة ومخزَّنة بأمان ولا تُباع أبدًا. يمكنك أيضًا ضبط قفل PIN اختياري وتفعيل الوضع الحسي لتخفيف الحركة وشدة الألوان على الشاشة.",
    "landing.faq.q4": "هل يمكنني فعلًا أخذ تقرير إلى طبيبي؟",
    "landing.faq.a4": "نعم. من منطقة التقارير يمكنك إنشاء ملخص PDF نظيف من صفحة واحدة لاتجاهاتك: أنماط الألم، وتكرار النوبات، ومتوسطات النوم والطاقة، جاهزًا للمشاركة في موعدك القادم.",
    "landing.faq.q5": "ماذا لو غيّبت يومًا؟",
    "landing.faq.a5": "لا شيء ينكسر. فيبروكير مصمَّم ليقابلك أينما كنت. غياب الأيام يعني فقط أن أنماطك تنمو ببطء أكبر قليلًا، لا أنك فشلت. الانتظام إيقاع، لا سلسلة.",
    "landing.faq.q6": "هل البدء مجاني؟",
    "landing.faq.a6": "نعم. التسجيل وبدء تسجيلاتك اليومية مجاني تمامًا دون بطاقة ائتمان. يمكنك استكشاف التدفق اليومي كاملًا قبل أي قرار آخر.",
    "landing.final.heading": "ابدأ من حيث أنت. لا من حيث القائمة.",
    "landing.final.copy": "دقيقتان اليوم. نمط أوضح هذا الأسبوع. محادثة أفضل مع فريق رعايتك عندما يلزم.",
    "landing.final.free": "مجاني للبدء · لا بطاقة ائتمان · بياناتك تبقى ملكك",
    "landing.marquee.words": "راحة إيقاع تنفّس ليونة أنصت لاحظ توقّف برفق",
    "landing.footer.tagline": "رفيق لطيف وخاص للحياة مع الفيبروميالجيا. ليس جهازًا طبيًا ولا بديلًا أبدًا عن فريق رعايتك.",
    "landing.footer.resources": "الموارد",
    "landing.footer.product": "المنتج",
    "landing.footer.about": "عن الفيبروميالجيا",
    "landing.footer.diagnosis": "الحصول على التشخيص",
    "landing.footer.treatment": "خيارات العلاج",
    "landing.footer.exercises": "حركة لطيفة",
    "landing.footer.nutrition": "التغذية",
    "landing.footer.faq": "الأسئلة الشائعة",
    "landing.footer.privacy": "سياسة الخصوصية",
    "landing.footer.terms": "شروط الخدمة",
    "landing.footer.madeWith": "صُنع بعناية.",
    "landing.footer.disclaimer": "ليس أداة تشخيصية. إذا كنت في حالة طوارئ، يرجى التواصل مع خدمات الطوارئ المحلية.",
    "landing.footer.copyright": "© {year} فيبروكير.",
    "notification.title": "الإشعارات",
    "notification.empty": "أنت على اطلاع كامل. ستظهر هنا تنبيهات لطيفة عند الحاجة.",
    "notification.markAllRead": "تحديد الكل كمقروء",
    "notification.bellAria": "فتح الإشعارات",
    "notification.closeAria": "إغلاق الإشعارات",
    "notification.dismissAria": "حذف الإشعار",
    "notification.unreadCount": "{count} إشعارات غير مقروءة",
    "notification.time.justNow": "الآن",
    "notification.time.minutesAgo": "قبل {count} د",
    "notification.time.hoursAgo": "قبل {count} س",
    "notification.time.daysAgo": "قبل {count} ي",
    "notification.type.weather_trigger": "تنبيه طقس",
    "notification.type.medication_reminder": "تذكير دواء",
    "notification.type.daily_checkin": "تسجيل يومي",
    "notification.type.zen_recommendation": "توصية زن",
    "notification.type.ai_prediction": "توقع ذكي",
    "notification.weather.pressureDrop.title": "انخفاض متوقع في الضغط",
    "notification.weather.pressureDrop.message": "الضغط الجوي في انخفاض ({delta} هيكتو باسكال). قد تشعر بحساسية أكبر في المفاصل والعضلات اليوم — خفّف وتيرة نشاطك.",
    "notification.weather.lowPressure.title": "ضغط جوي منخفض اليوم",
    "notification.weather.lowPressure.message": "الضغط عند {pressure} هيكتو باسكال، وهو ما قد يزيد الأوجاع. الدفء والترطيب قد يساعدان.",
    "notification.weather.humidity.title": "الرطوبة مرتفعة",
    "notification.weather.humidity.message": "الرطوبة عند {humidity}%، وهي محفّز معروف للفيبروميالجيا. حافظ على راحة الهواء في مكانك.",
    "notification.weather.heat.title": "تحذير من الحرارة",
    "notification.weather.heat.message": "درجة الحرارة {temperature}°م — قد تزيد الحرارة من الأعراض. ابقَ منتعشًا ورطبًا.",
    "notification.weather.cold.title": "تنبيه الطقس البارد",
    "notification.weather.cold.message": "درجة الحرارة {temperature}°م — قد يزيد البرد من التيبّس. ارتدِ ملابس دافئة وتحرّك بلطف.",
    "notification.ai.spike.title": "تم رصد ارتفاع في الألم",
    "notification.ai.spike.message": "آخر {count} تسجيلات وصلت إلى {threshold}/10 أو أكثر (الذروة {highest}/10). خذ قسطًا من الراحة وراجع ما قد يكون السبب.",
    "notification.medication.due.title": "موعد الدواء",
    "notification.medication.due.message": "حان وقت {name}. تناوله عندما تكون مستعدًا.",
    "notification.zen.reminder.title": "حان وقت استراحة زن",
    "notification.zen.reminder.message": "بضع دقائق من التنفس المنتظم يمكن أن تهدئ جهازك العصبي. جرّب جلسة في بوابة زن.",
    "notification.dailyLog.reminder.title": "تذكير بالتسجيل اليومي",
    "notification.dailyLog.reminder.message": "لم تسجّل اليوم. تسجيل سريع لمدة 30 ثانية يحافظ على دقة اتجاهات ألمك.",
    "meta.title": "فيبروكير - رفيق الصحة المتعاطف",
    "meta.description":
      "مساحة لطيفة وواعية بحالتك لإدارة أعراض الفيبروميالجيا، نوبات الألم، والعافية.",
    "meta.ogTitle": "فيبروكير - ألمُك حقيقي. وإيقاعُك ملكُك.",
    "meta.ogDescription":
      "تسجيلات يومية تحوّل الأعراض الخفية إلى أنماط واضحة، وأيام أكثر هدوءًا، وتقارير يفيد بها فريق رعايتك فعلًا.",
    "meta.ogImageAlt": "فيبروكير - ألمُك حقيقي. وإيقاعُك ملكُك.",
    "meta.ogFeaturesImageAlt":
      "فيبروكير - لقطات من زر النجدة ودرع الضباب والمركز الإكلينيكي، بالعربية والإنجليزية.",
    "doctor.title": "مركز الأطباء",
    "doctor.subtitle": "نشر رؤى صحية موثقة للمرضى",
    "doctor.newPost": "مقال جديد",
    "doctor.editPost": "تعديل المقال",
    "doctor.postTitle": "عنوان المقال",
    "doctor.postContent": "محتوى المقال",
    "doctor.postTags": "الوسوم (مفصولة بفاصلة)",
    "doctor.publish": "نشر",
    "doctor.draft": "حفظ كمسودة",
    "doctor.aiAssist": "مساعد النشر بالذكاء الاصطناعي",
    "doctor.aiAssistDescription": "صف فكرتك السريرية أو الصق ملاحظاتك الخام — سيقوم الذكاء الاصطناعي بتنسيقها إلى مقال إرشادي موثق للمرضى.",
    "doctor.aiGenerating": "جارٍ إنشاء مسودة المقال…",
    "doctor.aiDisclaimer": "يوفر الذكاء الاصطناعي ملخصات معلوماتية فقط ولا يحل محل الحكم السريري المباشر.",
    "doctor.verified": "موثق",
    "doctor.pending": "قيد المراجعة",
    "doctor.rejected": "مرفوض",
    "doctor.noPosts": "لم يتم نشر مقالات بعد. ابدأ بالكتابة لمشاركة خبراتك مع المرضى.",
    "doctor.feedTitle": "رؤى الأطباء",
    "doctor.feedSubtitle": "إرشادات صحية موثقة من متخصصين مرخصين",
    "doctor.readMore": "قراءة المقال كاملاً",
    "doctor.backToDashboard": "العودة للوحة التحكم",
    "doctor.dashboardTitle": "لوحة نشر الأطباء",
    "doctor.dashboardSubtitle": "إنشاء وإدارة محتوى صحي موجه للمرضى",
    "doctor.totalPosts": "إجمالي المقالات",
    "doctor.publishedCount": "منشور",
    "doctor.pendingCount": "قيد المراجعة",
    "doctor.aiLibrary.title": "مكتبة المقالات المولّدة بالذكاء الاصطناعي",
    "doctor.aiLibrary.subtitle": "مقالات مبنية على إرشادات Mayo Clinic و ACR، يوقّعها أطباء استشاريون مختارون بعناية.",
    "doctor.aiLibrary.reviewed": "موثّق طبياً",
    "doctor.aiLibrary.loading": "جاري تحميل المواضيع…",
    "doctor.aiLibrary.empty": "جاري تجهيز المكتبة…",
    "doctor.aiLibrary.newBadge": "جديد",
    "doctor.aiLibrary.read": "اقرأ المقال",
    "doctor.aiLibrary.disclaimer": "تنبيه: المقالات للتثقيف فقط ولا تحلّ محل الرعاية الطبية. ناقش أي تغيير مع طبيبك.",
    "doctor.aiLibrary.signature": "يوقّع كل مقال طبيب استشاري من مجموعة مختارة بعناية",
    "doctor.aiLibrary.refresh": "تحديث المكتبة",
    "doctor.aiLibrary.refreshing": "جاري التحديث…",
    "doctor.aiLibrary.refreshed": "تم تحديث المكتبة.",
    "doctor.aiLibrary.refreshError": "تعذّر تحديث المكتبة. حاول مرة أخرى.",
    "doctor.aiLibrary.minutesShort": "د",
    "doctor.aiLibrary.topicsAria": "مواضيع المقالات",
    "doctor.aiLibrary.aiGenerated": "مولّد بالذكاء الاصطناعي",
    "doctor.reactions.like": "إعجاب",
    "doctor.reactions.helpful": "مفيد",
    "doctor.reactions.signInHint": "سجّل الدخول للتفاعل.",
    "doctor.authorFallback": "طبيب",
    "doctor.postError": "تعذّر النشر.",
    "doctor.manualPublishing.title": "النشر اليدوي",
    "doctor.manualPublishing.subtitle": "اكتب مقالك بنفسك، حدّد التصنيفات، وقدّمه للمراجعة. تظهر مقالاتك المنشورة إلى جانب الإرشادات المولّدة بالذكاء الاصطناعي.",
    "doctor.manualPublishing.openEditor": "اكتب مقالاً جديداً",
    "doctor.manualPublishing.closeEditor": "إغلاق المحرر",
    "doctor.ownPosts.title": "مقالاتك",
    "doctor.ownPosts.subtitle": "كل مقال كتبته، بما في ذلك المسودات بانتظار المراجعة.",
    "doctor.postTitlePlaceholder": "مثال: نصائح لنظافة النوم لمرضى الفيبروميالغيا",
    "doctor.postContentPlaceholder": "اكتب محتوى مقالك هنا…",
    "doctor.postTagsPlaceholder": "نوم, إدارة الألم, تمارين",
    "doctor.aiAssistPlaceholder": "مثال: أبحاث جديدة عن نظافة النوم لمرضى الفيبروميالغيا…",
    "doctor.postSubmitted": "تم تقديم المقال للمراجعة!",
    "doctor.postEditorDescription": "اكتب كطبيب موثق — يُراجع منشورك قبل ظهوره للمرضى.",
    "doctor.postKindLabel": "نوع المحتوى",
    "doctor.kind.article": "مقال",
    "doctor.kind.research": "ملخص بحثي",
    "doctor.kind.status": "تحديث حالة",
    "doctor.socialFeedTitle": "الملف المهني",
    "doctor.socialFeedSubtitle": "رؤى من المجتمع الطبي",
    "doctor.composerPlaceholder": "شارك مقالاً أو بحثاً أو رؤية سريرية…",
    "doctor.feed.like": "إعجاب",
    "doctor.feed.comment": "تعليق",
    "doctor.feed.share": "مشاركة",
    "doctor.filter.all": "الكل",
    "doctor.feed.searchPlaceholder": "ابحث في العناوين والموضوعات والأطباء…",
    "doctor.feed.searchLabel": "البحث في المنشورات",
    "doctor.feed.clearSearch": "مسح البحث",
    "doctor.feed.topicsLabel": "الموضوعات",
    "doctor.feed.sortLabel": "الترتيب",
    "doctor.feed.sort.newest": "الأحدث",
    "doctor.feed.sort.popular": "الأكثر إعجابًا",
    "doctor.feed.resultsCount": "عرض {count} من {total} منشورًا",
    "doctor.feed.noResults": "لا توجد منشورات مطابقة للفلاتر",
    "doctor.feed.noResultsHint": "جرّب كلمة بحث مختلفة أو أزل فلتر موضوع.",
    "doctor.feed.activeFilters": "الفلاتر النشطة",
    "doctor.feed.clearAll": "مسح الكل",
    "doctor.feed.filtersToggle": "البحث والفلاتر",
    "doctor.postMedia": "رابط الوسائط",
    "doctor.postContentStatus": "التحديث",
    "doctor.postAiToggle": "مساعد الذكاء الاصطناعي — هيكلة ملاحظاتي",
    "doctor.postAiToggleDescription": "ينظم الذكاء الاصطناعي ملاحظاتك السريرية الخام في مسودة واضحة مدعومة بالأدلة (إرشادات للمرضى وفق ACR ومايو كلينك). تراجع وتعدّل كل شيء قبل النشر.",
    "doctor.postSubmittedStatus": "تم إرسال التحديث للمراجعة!",
    "consultation.title": "الاستشارات",
    "consultation.subtitle": "رسائل آمنة مع فريق رعايتك",
    "consultation.newConsultation": "استشارة جديدة",
    "consultation.subject": "الموضوع",
    "consultation.selectDoctor": "اختر طبيبًا",
    "consultation.startThread": "بدء محادثة",
    "consultation.open": "مفتوح",
    "consultation.closed": "مغلق",
    "consultation.messages": "الرسائل",
    "consultation.typeMessage": "اكتب رسالتك…",
    "consultation.hide": "إخفاء",
    "consultation.dismiss": "إغلاق",
    "consultation.structuredMessage": "رسالة منظمة",
    "consultation.suggestedQuestions": "أسئلة مقترحة:",
    "consultation.noMessages": "لا توجد رسائل بعد. ابدأ المحادثة أدناه.",
    "consultation.unknown": "غير معروف",
    "consultation.patientLabel": "المريض",
    "consultation.doctorLabel": "الطبيب",
    "consultation.send": "إرسال",
    "consultation.noConsultations": "لا توجد استشارات بعد. ابدأ محادثة مع طبيب موثق.",
    "consultation.patientAssistant": "منظم الأعراض",
    "consultation.patientAssistantDescription": "يساعدك الذكاء الاصطناعي في تنظيم أعراضك وتاريخ أدويتك ومخاوفك في رسالة واضحة واحترافية لطبيبك.",
    "consultation.clinicalSummary": "ملخص سريري",
    "consultation.clinicalSummaryDescription": "ملخص للأعراض والأدوية خلال 30 يومًا مولّد بالذكاء الاصطناعي للطبيب.",
    "consultation.aiDraft": "مسودة رد بالذكاء الاصطناعي",
    "consultation.aiDraftDescription": "يقترح الذكاء الاصطناعي مسودة رد بناءً على رسالة المريض وسجله السريري.",
    "consultation.aiDisclaimer": "يوفر الذكاء الاصطناعي ملخصات معلوماتية فقط ولا يحل محل الحكم السريري المباشر.",
    "consultation.symptomHelper": "هيكلة أعراضي",
    "consultation.symptomHelperDescription": "صف شعورك وسيساعدك الذكاء الاصطناعي في التواصل بشكل واضح مع طبيبك.",
    "consultation.symptomPlaceholder": "صف كيف تشعر مؤخراً — الأسباب، النوم، الطاقة، أي تغييرات…",
    "consultation.noDoctorsAvailable": "لا يوجد أطباء متاحون حالياً.",
    "consultation.selectDoctorPlaceholder": "اختر طبيباً…",
    "consultation.subjectPlaceholder": "مثال: متابعة تعديل الأدوية",
    "consultation.backToList": "العودة للاستشارات",
    "consultation.clinicalMemo": "مذكرة سريرية",
    "consultation.suggestedResponse": "رد مقترح",
    "consultation.useDraft": "استخدام هذه المسودة",
    "pro.page.title": "فيبروكير برو",
    "pro.page.subtitle": "افتح القوة الكاملة لإدارة الفبروميالغيا بالذكاء الاصطناعي مع فريق رعايتك.",
    "pro.page.doctorHubTitle": "قسم الأطباء المخصص",
    "pro.page.doctorHubDesc": "مساحة مخصصة للأطباء الموثقين لنشر مقالات وإرشادات صحية موثوقة لمرضى الفبروميالغيا.",
    "pro.page.consultationsTitle": "التواصل المباشر مع الطبيب",
    "pro.page.consultationsDesc": "غرفة شات آمنة بينك وطبيبك المعالج — ناقش الأعراض والعلاجات والتقدم بخصوصية.",
    "pro.page.aiCopilotTitle": "المساعد الذكي الطبي",
    "pro.page.aiCopilotDesc": "أدوات مدعومة بالذكاء الاصطناعي تلخص بيانات صحتك لـ 30 يومًا للطبيب وتساعدك في صياغة الأسئلة الطبية بدقة.",
    "pro.page.cta": "الترقية إلى برو",
    "pro.page.doctorHubBadge": "قسم الأطباء",
    "pro.page.consultationsBadge": "الاستشارات",
    "pro.page.aiCopilotBadge": "المساعد الذكي",
    "symptomTracker.title": "قائمة الأعراض",
    "symptomTracker.subtitle": "تتبع أعراضك لتتذكّر كل شيء في زيارة طبيبك القادمة",
    "symptomTracker.selectSymptoms": "اختر ما ينطبق عليك",
    "symptomTracker.notes": "ملاحظات إضافية",
    "symptomTracker.notesPlaceholder": "أضف أي تفاصيل أو محفزات أو ملاحظات لطبيبك...",
    "symptomTracker.generateReport": "إنشاء تقرير زيارة الطبيب",
    "symptomTracker.collapseAll": "طي الكل",
    "symptomTracker.expandAll": "توسيع الكل",
    "symptomTracker.clearAll": "مسح الكل",
    "symptomTracker.totalChecked": "{count} أعراض محددة",
    "symptomTracker.category.pain": "مواقع الألم والألم المنتشر",
    "symptomTracker.category.physical": "الأعراض الجسدية والعصبية العامة",
    "symptomTracker.category.postExertional": "إرهاق ما بعد النشاط والمحفزات",
    "symptomTracker.category.headFaceJaw": "الرأس والوجه والفك",
    "symptomTracker.category.sensory": "الحساسيات الحسية والمرتبطة",
    "symptomTracker.pain.neckShoulders": "الرقبة والكتفين",
    "symptomTracker.pain.upperBack": "الظهر العلوي",
    "symptomTracker.pain.lowerBackHips": "الظهر السفلي والورك",
    "symptomTracker.pain.armsElbows": "الذراعين والمرفقين",
    "symptomTracker.pain.legsKnees": "الساقين والركبتين",
    "symptomTracker.pain.chestWall": "جدار الصدر",
    "symptomTracker.physical.severeFatigue": "إرهاق شديد",
    "symptomTracker.physical.morningStiffness": "تيبس الصباح",
    "symptomTracker.physical.sleepDisturbances": "اضطرابات النوم / الأرق",
    "symptomTracker.physical.numbnessTingling": "تنميل وخدر في اليدين/القدمين",
    "symptomTracker.physical.rls": "متلازمة تململ الساقين",
    "symptomTracker.physical.burningColdSensations": "إحساس بالحرقان/البرودة في الساقين",
    "symptomTracker.postExertional.postShower": "إرهاق ما بعد الاستحمام",
    "symptomTracker.postExertional.postMeal": "إرهاق ونوبات ما بعد الوجبات",
    "symptomTracker.postExertional.exhaustionGoingOut": "إرهاق بعد الخروج من المنزل",
    "symptomTracker.head.fibroFog": "ضباب الألياف ومشاكل التركيز",
    "symptomTracker.head.memoryLapses": "فراغات الذاكرة",
    "symptomTracker.head.tensionHeadaches": "صداع التوتر والشقيقة",
    "symptomTracker.head.tmjJawPain": "ألم الفك / TMJ",
    "symptomTracker.head.facialTension": "توتر الوجه وإجهاد العينين",
    "symptomTracker.sensory.lightNoise": "حساسية للضوء / الضوضاء / درجة الحرارة",
    "symptomTracker.sensory.ibsDigestive": "القولون العصبي ومشاكل الجهاز الهضمي",
    "symptomTracker.sensory.palpitationsDizziness": "خفقان / دوخة",
    "symptomTracker.sensory.moodAnxiety": "تغيرات المزاج والقلق",
    "doctorReport.title": "تقرير زيارة الطبيب",
    "doctorReport.subtitle": "ملخص أعراضك لطبيب الرعاية الصحية",
    "doctorReport.close": "إغلاق",
    "doctorReport.patientInfo": "معلومات المريض",
    "doctorReport.date": "التاريخ",
    "doctorReport.painLevel": "مستوى الألم",
    "doctorReport.energyMood": "الطاقة والمزاج",
    "doctorReport.checkedSymptoms": "الأعراض المُبلّغ عنها",
    "doctorReport.category": "الفئة",
    "doctorReport.notes": "ملاحظات المريض",
    "doctorReport.noSymptoms": "لم يتم اختيار أي أعراض",
    "doctorReport.noNotes": "لم تُضف ملاحظات",
    "doctorReport.noSymptomsMessage": "لم يحدد المريض أي أعراض لهذه الزيارة.",
    "doctorReport.noNotesMessage": "لم تُقدم أي ملاحظات إضافية.",
    "doctorReport.copyToClipboard": "نسخ إلى الحافظة",
    "doctorReport.copied": "تم النسخ!",
    "doctorReport.printReport": "طباعة التقرير",
    "doctorReport.disclaimer": "تم إنشاء هذا التقرير بواسطة المريض باستخدام فيبروكير وهو ليس تشخيصًا طبيًا. يرجى مراجعته مع مقدم الرعاية الصحية.",
    "nav.diet": "النظام الغذائي والمهيجات",
    "diet.title": "متتبع مهيجات النظام الغذائي",
    "diet.subtitle": "سجّل وجباتك، واحتفظ بقائمة مهيجاتك الشخصية، واكتشف كيف ترتبط وجبات المساء بأعراض الصباح التالي.",
    "diet.energy.exhausted": "منهك",
    "diet.energy.low": "طاقة منخفضة",
    "diet.energy.moderate": "معتدل",
    "diet.energy.good": "جيد",
    "diet.energy.full": "طاقة كاملة",
    "diet.logger.title": "تسجيل وجبة",
    "diet.logger.subtitle": "تحذيرات فورية من المهيجات أثناء إدخال الأطعمة.",
    "diet.logger.date": "التاريخ",
    "diet.logger.time": "الوقت",
    "diet.logger.mealType": "نوع الوجبة",
    "diet.logger.mealType.breakfast": "فطور",
    "diet.logger.mealType.lunch": "غداء",
    "diet.logger.mealType.dinner": "عشاء",
    "diet.logger.mealType.snack": "وجبة خفيفة",
    "diet.logger.foods": "الأطعمة المتناولة",
    "diet.logger.foodsPlaceholder": "مثال: سمك السلمون المشوي، بروكلي مطهو على البخار",
    "diet.logger.amount": "الكمية",
    "diet.logger.amountPlaceholder": "مثال: وعاء واحد، 150 غرام",
    "diet.logger.addFood": "إضافة طعام",
    "diet.logger.energyBefore": "مستوى الطاقة قبل هذه الوجبة",
    "diet.logger.energyBefore.hint": "0 = منهك · 4 = طاقة كاملة",
    "diet.logger.notes": "ملاحظات",
    "diet.logger.notesPlaceholder": "كيف شعرت بعد هذه الوجبة؟",
    "diet.logger.save": "حفظ الوجبة",
    "diet.logger.saving": "جارٍ الحفظ…",
    "diet.logger.saved": "تم حفظ الوجبة",
    "diet.logger.delete": "حذف",
    "diet.logger.noMeals": "لا توجد وجبات مسجلة لهذا التاريخ بعد.",
    "diet.logger.mealsLabel": "الوجبات المسجلة",
    "diet.warn.known.gluten": "الغلوتين (القمح، الخبز، المعكرونة)",
    "diet.warn.known.dairy": "الألبان (حليب، جبن، زبادي)",
    "diet.warn.known.sugar": "السكر المكرر والحلويات",
    "diet.warn.known.fried": "الأطعمة المقلية",
    "diet.warn.known.processed": "الأطعمة المصنعة والوجبات السريعة",
    "diet.warn.known.alcohol": "الكحول",
    "diet.warn.known.caffeine": "الكافيين",
    "diet.warn.personal": "أدرجت هذا الطعام كمهيج شخصي لك",
    "diet.warnings.none": "لم تُرصد مهيجات معروفة — اختيار رائع.",
    "diet.warnings.some": "مهيجات محتملة في هذه الوجبة",
    "diet.warnings.swap": "فكرة بديلة",
    "diet.warnings.reason": "السبب",
    "diet.swap.gluten.swap": "استبدله بالشوفان أو الأرز الخالي من الغلوتين",
    "diet.swap.gluten.reason": "قد يسبب الغلوتين التعب وتيبس المفاصل لدى الأشخاص الحساسين.",
    "diet.swap.dairy.swap": "استبدله بحليب الشوفان أو اللوز",
    "diet.swap.dairy.reason": "الألبان حساسية غذائية شائعة لدى مرضى الفيبروميالغيا.",
    "diet.swap.sugar.swap": "استبدل السكر المكرر بالتمر أو التوت",
    "diet.swap.sugar.reason": "ارتفاع السكر قد يزيد من انهيار الطاقة في منتصف اليوم.",
    "diet.swap.fried.swap": "اختر خيارات مشوية أو مقلية بالهواء",
    "diet.swap.fried.reason": "تحتوي الأطعمة المقلية على دهون التهابية قد تزيد الألم.",
    "diet.swap.processed.swap": "اختر بديلاً من الأطعمة الكاملة",
    "diet.swap.processed.reason": "غالبًا ما تحتوي الأطعمة فائقة المعالجة على إضافات مسببة للالتهاب.",
    "diet.swap.alcohol.swap": "استبدله بماء فوار مع ليمون",
    "diet.swap.alcohol.reason": "قد يخل الكحول بالنوم العميق ويزيد التعب في اليوم التالي.",
    "diet.swap.caffeine.swap": "استبدله بشاي أعشاب أو منزوع الكافيين",
    "diet.swap.caffeine.reason": "الكافيين المتأخر قد يؤخر النوم ويزيد ضبابية الدماغ.",
    "diet.timing.veryLow.title": "تناول عشاءً خفيفًا ومبكرًا الليلة",
    "diet.timing.veryLow.reason": "طاقة منخفضة جدًا — عشاء خفيف قبل 19:00 يدعم التعافي بشكل أفضل.",
    "diet.timing.low.title": "ابدأ بعشاء أبكر",
    "diet.timing.low.reason": "جرّب إنهاء العشاء قبل 20:00 لحماية نافذة نومك.",
    "diet.timing.moderate.title": "حافظ على وجبة عشاء متوازنة",
    "diet.timing.moderate.reason": "عشاء متوازن مع البروتين والخضروات يدعم استقرار الطاقة.",
    "diet.timing.good.title": "أنت في نافذة جيدة",
    "diet.timing.good.reason": "حافظ على عشاءك المتوازن المعتاد واشرب كمية كافية من الماء.",
    "diet.timing.full.title": "طاقة كاملة — حافظ على التغذية الجيدة",
    "diet.timing.full.reason": "طاقة رائعة اليوم — عشاء غني بالعناصر الغذائية يدعم غدك.",
    "diet.triggers.title": "قائمتي الشخصية للمهيجات",
    "diet.triggers.subtitle": "الأطعمة التي غالبًا ما تؤدي إلى نوباتك — سننبهك إليها كلما ظهرت في أي وجبة.",
    "diet.triggers.name": "اسم الطعام",
    "diet.triggers.severity": "الشدة",
    "diet.triggers.severity.hint": "1 = خفيف · 5 = رد فعل شديد",
    "diet.triggers.severity.level1": "خفيف",
    "diet.triggers.severity.level2": "خفيف إلى متوسط",
    "diet.triggers.severity.level3": "متوسط",
    "diet.triggers.severity.level4": "قوي",
    "diet.triggers.severity.level5": "شديد",
    "diet.triggers.reactionNote": "كيف يؤثر عليك؟",
    "diet.triggers.reactionNotePlaceholder": "مثال: تعب في اليوم التالي، آلام في المفاصل",
    "diet.triggers.namePlaceholder": "مثال: ثوم، حمضيات، نبيذ أحمر",
    "diet.triggers.add": "إضافة إلى قائمتي",
    "diet.triggers.adding": "جارٍ الإضافة…",
    "diet.triggers.empty": "لا توجد مهيجات شخصية بعد — أضف الأطعمة التي لاحظت أنها تعيقك.",
    "diet.triggers.remove": "إزالة",
    "diet.triggers.removed": "تمت إزالة المهيج",
    "diet.correlation.title": "ارتباط نوبة اليوم التالي",
    "diet.correlation.subtitle": "وجبات المساء مقارنة بأعراض الصباح التالي — إشارة نمطية، وليست تشخيصًا.",
    "diet.correlation.disclaimer": "ارتباط فقط — وليس تشخيصًا طبيًا.",
    "diet.correlation.empty": "سجّل بضع وجبات مسائية (مع سجلات ألم أو أعراض في اليوم التالي) وسيعثر هذا القسم على الأنماط.",
    "diet.correlation.baseline": "درجة اليوم التالي الأساسية",
    "diet.correlation.baseline.hint": "متوسط درجة الأعراض بعد أي وجبة مسائية",
    "diet.correlation.food": "الطعام",
    "diet.correlation.with": "الدرجة بعد تناوله",
    "diet.correlation.without": "الدرجة بدونه",
    "diet.correlation.lift": "الرفع",
    "diet.correlation.outOf": "من 10",
    "diet.correlation.evenings": "الأمسيات",
    "diet.correlation.risk.high": "اشتباه مرتفع",
    "diet.correlation.risk.moderate": "اشتباه متوسط",
    "diet.correlation.risk.watch": "متابعة",
    "diet.correlation.risk.high.hint": "مرتبط بقوة بأعراض صباحك التالي في سجلاتك.",
    "diet.correlation.risk.moderate.hint": "قد يكون مرتبطًا — يستحق تجربة واعية.",
    "diet.correlation.risk.watch.hint": "عينات قليلة جدًا أو لا توجد إشارة واضحة بعد.",
    "diet.correlation.timing.title": "توقيت العشاء",
    "diet.correlation.timing.highFlare": "متوسط ساعة العشاء في صباحات النوبات",
    "diet.correlation.timing.lowFlare": "متوسط ساعة العشاء في الصباحات الهادئة",
    "diet.correlation.timing.later": "تميل العشاءات المتأخرة إلى الارتباط بنوبات الصباح التالي. حاول تناول الطعام قبل {hour}:00 لحماية نومك.",
    "diet.correlation.timing.nodata": "لا توجد بيانات كافية بعد.",

    "fog.title": "درع الضباب",
    "fog.hero.kicker": "حالة الطقس الإدراكي",
    "fog.hero.subtitle": "مكان آمن وخاص لاجتياز نوبة ضباب الدماغ — خفّفها بالتنفس، أو أفرغ الأفكار المشوشة، أو قسّم مهمة صعبة إلى خطوات، أو فعّل بروتوكول SOS. وأي أداة تستخدمها، يتلاشى الضباب أمام عينيك.",
    "fog.hero.statEpisodes": "النوبات المسجلة",
    "fog.hero.statAvg": "متوسط الضباب",
    "fog.hero.statRecent": "الضباب مؤخرًا",
    "fog.hero.statNone": "—",
    "fog.hero.clearGuide": "الصفاء قريب. لقد عدت إلى مكانك.",
    "fog.hero.fogGuide": "اختر أداة بالأسفل. كل أداة تبدد جزءًا من الضباب.",
    "fog.hero.privacy": "يحافظ درع الضباب على خصوصية تدويناتك:",
    "fog.hero.privacyDetail": "نص التفريغ يُشفَّر قبل تخزينه، ولا يُعرض عليك مرة أخرى.",
    "fog.trigger.lowSleep": "قلة النوم",
    "fog.trigger.stress": "التوتر",
    "fog.trigger.screen": "استخدام الشاشات لفترة طويلة",
    "fog.trigger.noise": "الضوضاء",
    "fog.trigger.lowFood": "تفويت الوجبات",
    "fog.trigger.menstrual": "الدورة الشهرية",
    "fog.trigger.multitasking": "المهام المتعددة",
    "fog.trigger.overwhelm": "الإرهاق الذهني",
    "fog.trigger.weather": "الطقس / الضغط الجوي",
    "fog.trigger.medication": "تفويت الدواء",
    "fog.trigger.overdid": "المبالغة في النشاط",
    "fog.trigger.other": "سبب آخر",
    "fog.breath.title": "إعادة ضبط التنفس 4-7-8",
    "fog.breath.subtitle": "أبطئ الدوامة. يهدأ الضباب عندما يهدأ النفس.",
    "fog.breath.pattern478": "4-7-8",
    "fog.breath.patternBox": "المربع",
    "fog.breath.start": "ابدأ التنفس",
    "fog.breath.pause": "إيقاف مؤقت",
    "fog.breath.reset": "إعادة",
    "fog.breath.cycles": "دورات",
    "fog.breath.sessionComplete": "هدأ النفس — بدأ الصفاء يعود.",
    "fog.breath.seconds": "ث",
    "fog.breath.inhale": "شهيق",
    "fog.breath.hold": "احبس",
    "fog.breath.exhale": "زفير",
    "fog.dump.title": "تفريغ الذهن",
    "fog.dump.subtitle": "أفرغ الأفكار المشوشة على الورق. يمكنها البقاء هنا — أو ألا تبقى أبدًا.",
    "fog.dump.where": "ماذا يدور في رأسك؟ كل فكرة، وقلق، ومهمة ناقصة، وصوت، وألم.",
    "fog.dump.chars": "حرفًا",
    "fog.dump.intensity": "شدة الضباب",
    "fog.dump.triggers": "ما الذي يغذّي الضباب غالبًا؟",
    "fog.dump.save": "احفظ في سجل الضباب",
    "fog.dump.saving": "جارٍ الحفظ…",
    "fog.dump.saved": "تم التفريغ — خرج من رأسك.",
    "fog.dump.clear": "مسح",
    "fog.dump.needsOne": "أضف فكرة، أو حدد مهيجًا واحدًا على الأقل.",
    "fog.dump.recent": "الضباب الأخير",
    "fog.dump.noTriggers": "لم تُحدد أي مهيجات",
    "fog.save.locked": "افتح قفل FibroCare لحفظ سجل الضباب.",
    "fog.save.invalid": "يرجى إكمال سجل الضباب بشكل صحيح.",
    "fog.save.failed": "تعذر حفظ سجل الضباب. حاول مرة أخرى.",
    "fog.microtask.title": "تقسيم المهمة الدقيقة",
    "fog.microtask.subtitle": "مهمة واحدة مرهقة → ثلاث خطوات صغيرة. الخطوات الصغيرة لا يتأثر بها الضباب.",
    "fog.microtask.prompt": "ما المهمة التي تبدو كبيرة جدًا الآن؟",
    "fog.microtask.placeholder": "مثال: التحضير لموعد الغد",
    "fog.microtask.breakdown": "قسّمها",
    "fog.microtask.step": "خطوة",
    "fog.microtask.saveToggle": "سجّل هذا في سجل الضباب",
    "fog.microtask.saved": "تم التسجيل — خفّ الضباب.",
    "fog.microtask.allDone": "اكتملت كل الخطوات. أصبحت المهمة قابلة للتحرك.",
    "fog.microtask.newTask": "مهمة جديدة",
    "fog.microtask.theTask": "تلك المهمة",
    "fog.microtask.assist1": "خذ نفسًا 4-7-8 واحدًا قبل لمس «{task}».",
    "fog.microtask.assist2": "افتح أول دقيقة منها فقط — القراءة وحدها تكفي.",
    "fog.microtask.assist3": "أنجز جزءًا صغيرًا واحدًا ثم توقف. الإنجاز يُحتسب.",
    "fog.sos.title": "بروتوكول SOS",
    "fog.sos.subtitle": "حين يكون الضباب مخيفًا، لا مجرد صعب. خطوات قصيرة وواضحة وإنسانية.",
    "fog.sos.step1": "سمِّه بصوت مسموع",
    "fog.sos.step1desc": "«أنا آمن، وهذا الضباب مؤقت.» سمِّ ثلاثة أشياء تراها.",
    "fog.sos.step2": "ماء بارد",
    "fog.sos.step2desc": "ضع ماءً باردًا على معصميك ووجهك. الحرارة تخترق الضباب بسرعة.",
    "fog.sos.step3": "خذ نفسًا واحدًا",
    "fog.sos.step3desc": "نفس واحد 4-7-8 — لا خمسة. واحد يكفي للبدء.",
    "fog.sos.step4": "تحرّك نحو شخص",
    "fog.sos.step4desc": "تتقلص الأماكن الصاخبة عندما يسمعك أحد. اتصل بإنسان واحد.",
    "fog.sos.steady": "أشعر بثبات أكبر الآن",
    "fog.sos.callClinic": "اتصل بعيادتك",
    "fog.sos.callTrusted": "اتصل بشخص تثق به",
    "fog.sos.emergency": "إذا شعرت بعدم الأمان، أو لاحظت تغيرًا مفاجئًا في الأعراض، فاتصل برقم الطوارئ الآن.",
    "fog.sos.steadier": "ارتفع الضباب بما يكفي — لقد عدت إلى مكانك.",
    "quickActions.fog.title": "درع الضباب",
    "quickActions.fog.description": "أدوات تأريض لنوبات ضباب الدماغ",
    "toolkit.fogCard.title": "درع الضباب",
    "toolkit.fogCard.subtitle": "نفّس الضباب، وأفرغ الأفكار، وقسّم مهمة صعبة — هنا مباشرة.",
    "toolkit.fogCard.open": "افتح درع الضباب",

    "clinical.acr.title": "تقييم ACR",
    "clinical.acr.subtitle": "فحص ذاتي وفق معايير ACR 2010/2016 — أداة مساعدة للفحص، وليست تشخيصًا.",
    "clinical.acr.ss.level.0": "لا توجد أعراض",
    "clinical.acr.ss.level.1": "خفيفة",
    "clinical.acr.ss.level.2": "متوسطة",
    "clinical.acr.ss.level.3": "شديدة",
    "clinical.acr.wpi.title": "مؤشر الألم المنتشر (WPI)",
    "clinical.acr.wpi.subtitle": "اضغط على كل منطقة شعرت بألم فيها خلال آخر 7 أيام.",
    "clinical.acr.wpi.count": "تم اختيار {count} من 19 منطقة",
    "clinical.acr.ss.title": "درجة شدة الأعراض (SS)",
    "clinical.acr.ss.hint": "قيّم كل بُعد خلال الأسبوع الماضي.",
    "clinical.acr.ss.fatigue": "الإرهاق",
    "clinical.acr.ss.unrefreshed": "الاستيقاظ دون انتعاش",
    "clinical.acr.ss.cognitive": "الأعراض الإدراكية",
    "clinical.acr.somatic.title": "قائمة الأعراض الجسدية",
    "clinical.acr.somatic.subtitle": "حدّد الأعراض التي عانيت منها مؤخرًا.",
    "clinical.acr.somatic.bandHint": "تم اختيار {count} ← مستوى الشدة: {band}",
    "clinical.acr.duration.title": "المدة",
    "clinical.acr.duration.label": "استمرت الأعراض بمستوى مماثل لمدة 3 أشهر على الأقل.",
    "clinical.acr.evaluate": "احسب التقييم",
    "clinical.acr.result.criteriaMet": "المعايير محققة",
    "clinical.acr.result.criteriaNotMet": "المعايير غير محققة بالكامل",
    "clinical.acr.result.interpretation": "يعكس ذلك إجاباتك على أسئلة فحص ACR — وليس تشخيصًا طبيًا.",
    "clinical.acr.result.wpi": "WPI",
    "clinical.acr.result.ss": "SS",
    "clinical.acr.result.generalized": "الانتشار",
    "clinical.acr.result.scoreRule": "قاعدة الدرجة",
    "clinical.acr.result.duration": "المدة ≥ 3 أشهر",
    "clinical.acr.result.met": "محقق",
    "clinical.acr.result.notMet": "غير محقق",
    "clinical.acr.summaryTitle": "ملخص لطبيبك",
    "clinical.acr.summary.wpi": "مناطق مؤلمة من أصل 19",
    "clinical.acr.summary.ss": "شدة الأعراض",
    "clinical.acr.summary.generalized": "المناطق المنتشرة",
    "clinical.acr.summary.scoreRule": "قاعدة الدرجة",
    "clinical.acr.summary.duration": "المدة",
    "clinical.acr.summary.criteria": "معايير ACR",
    "clinical.acr.savedToProfile": "تم الحفظ في ملفك",
    "clinical.acr.signInHint": "سجّل الدخول للحفظ",
    "clinical.acr.saveToProfile": "حفظ في ملفي",
    "clinical.acr.savedToProfileHint": "تم الحفظ في ملفك. يمكنك مشاركته مع طبيبك.",
    "clinical.acr.signInHintBody": "بالحفظ يمكنك مشاركة هذه اللقطة مع طبيبك. يرجى تسجيل الدخول أولًا.",
    "clinical.acr.shareError": "حدث خطأ أثناء الحفظ. حاول مرة أخرى.",
    "clinical.acr.disclaimer": "أداة فحص مساعدة فقط — وليست تشخيصًا. ناقش النتائج مع طبيب مختص.",

    "clinical.somatic.headache": "صداع",
    "clinical.somatic.lowerAbdomenPain": "ألم أو تقلصات في أسفل البطن",
    "clinical.somatic.depression": "اكتئاب",
    "clinical.somatic.constipation": "إمساك",
    "clinical.somatic.diarrhea": "إسهال",
    "clinical.somatic.nausea": "غثيان",
    "clinical.somatic.dizziness": "دوار",
    "clinical.somatic.tingling": "تنميل / خدر",
    "clinical.somatic.irritableBowel": "متلازمة القولون العصبي",
    "clinical.somatic.tinnitus": "طنين الأذن",
    "clinical.somatic.blurredVision": "تشوش الرؤية",
    "clinical.somatic.chestPain": "ألم في الصدر",
    "clinical.somatic.dryMouth": "جفاف الفم",
    "clinical.somatic.mouthUlcers": "تقرحات الفم",
    "clinical.somatic.skinSensitivity": "حساسية الجلد",
    "clinical.somatic.anxiety": "قلق",
    "clinical.somatic.restlessLegs": "تململ الساقين",
    "clinical.somatic.coldIntolerance": "عدم تحمل البرد",

    "clinical.wpi.shoulderL": "الكتف — الأيسر",
    "clinical.wpi.shoulderR": "الكتف — الأيمن",
    "clinical.wpi.upperArmL": "الذراع العلوي — الأيسر",
    "clinical.wpi.upperArmR": "الذراع العلوي — الأيمن",
    "clinical.wpi.lowerArmL": "الذراع السفلي — الأيسر",
    "clinical.wpi.lowerArmR": "الذراع السفلي — الأيمن",
    "clinical.wpi.hipL": "الورك — الأيسر",
    "clinical.wpi.hipR": "الورك — الأيمن",
    "clinical.wpi.upperLegL": "الفخذ — الأيسر",
    "clinical.wpi.upperLegR": "الفخذ — الأيمن",
    "clinical.wpi.lowerLegL": "الساق — اليسرى",
    "clinical.wpi.lowerLegR": "الساق — اليمنى",
    "clinical.wpi.jawL": "الفك — الأيسر",
    "clinical.wpi.jawR": "الفك — الأيمن",
    "clinical.wpi.chest": "الصدر",
    "clinical.wpi.abdomen": "البطن",
    "clinical.wpi.neck": "الرقبة",
    "clinical.wpi.upperBack": "الظهر العلوي",
    "clinical.wpi.lowerBack": "الظهر السفلي",

    "clinical.meds.title": "الأدوية والمكملات",
    "clinical.meds.subtitle": "تتبع جرعاتك والتزامك اليومي — معلومات إرشادية، وليست نصيحة علاجية.",
    "clinical.meds.due": "مستحق الآن",
    "clinical.meds.dueEmpty": "لا شيء مستحق الآن. حافظ على إيقاع منتظم.",
    "clinical.meds.taken": "تم تناوله ✓",
    "clinical.meds.markTaken": "تحديد كمتناول",
    "clinical.meds.adherence": "الالتزام خلال 7 أيام",
    "clinical.meds.mySchedule": "جدولي",
    "clinical.meds.empty": "جدولك فارغ. أضف أدوية ومكملات شائعة أدناه.",
    "clinical.meds.remove": "إزالة {name}",
    "clinical.meds.addTitle": "أضف من القائمة الشائعة",
    "clinical.meds.add": "إضافة",
    "clinical.meds.addAria": "إضافة {name} إلى جدولي",
    "clinical.meds.disclaimer": "معلومات إرشادية فقط — لا توقف أو تبدأ أو تغيّر أي دواء دون استشارة الطبيب.",
    "clinical.meds.frequency.once": "مرة يوميًا",
    "clinical.meds.frequency.twice": "مرتين يوميًا",
    "clinical.meds.frequency.threeTimes": "ثلاث مرات يوميًا",
    "clinical.meds.frequency.asNeeded": "عند الحاجة",

    "clinical.trigger.title": "سجل محفزات النوبات",
    "clinical.trigger.subtitle": "اكتشف العوامل التي ترتبط عادةً بأقوى نوباتك.",
    "clinical.trigger.date": "التاريخ",
    "clinical.trigger.severity": "الشدة",
    "clinical.trigger.severityHint": "0 = لا نوبة · 10 = أسوأ نوبة شعرت بها",
    "clinical.trigger.factors": "العوامل المشتبه بها",
    "clinical.trigger.note": "ملاحظة",
    "clinical.trigger.notePlaceholder": "ماذا حدث؟ طقس، ضغط، أنشطة…",
    "clinical.trigger.addEntry": "إضافة تسجيل",
    "clinical.trigger.added": "تمت الإضافة ✓",
    "clinical.trigger.insights": "أنماطك حتى الآن",
    "clinical.trigger.frequencyLabel": "{count} تسجيل",
    "clinical.trigger.avgSeverity": "متوسط {avg}/10",
    "clinical.trigger.history": "السجل",
    "clinical.trigger.empty": "لا توجد تسجيلات بعد. سجّل أول نوبة لتكتشف الأنماط.",
    "clinical.trigger.delete": "حذف التسجيل",
    "clinical.trigger.group.weather": "الطقس",
    "clinical.trigger.group.stress": "الضغط والمشاعر",
    "clinical.trigger.group.sleep": "النوم",
    "clinical.trigger.group.diet": "النظام الغذائي",
    "clinical.trigger.group.activity": "النشاط",
    "clinical.trigger.group.other": "أخرى",
    "clinical.trigger.weatherPressure": "تغير الضغط / الطقس",
    "clinical.trigger.cold": "البرد",
    "clinical.trigger.heat": "الحرارة",
    "clinical.trigger.stress": "الضغط النفسي",
    "clinical.trigger.poorSleep": "نوم سيئ",
    "clinical.trigger.overexertion": "إجهاد زائد",
    "clinical.trigger.dietary": "النظام الغذائي (مثل: السكر والكحول)",
    "clinical.trigger.sittingTooLong": "الجلوس الطويل",
    "clinical.trigger.hormonal": "التغيرات الهرمونية",
    "clinical.trigger.illness": "مرض / عدوى",

    "clinical.lab.title": "نتائج المختبر والمؤشرات الحيوية",
    "clinical.lab.subtitle": "تتبع الفحوصات الكلاسيكية لاستبعاد الحالات المتداخلة: الغدة الدرقية وفيتامين د وESR وCRP.",
    "clinical.lab.latestNone": "لا نتائج بعد",
    "clinical.lab.test": "الفحص",
    "clinical.lab.date": "التاريخ",
    "clinical.lab.value": "القيمة",
    "clinical.lab.valueRequired": "أدخل قيمة رقمية لإضافة النتيجة.",
    "clinical.lab.hint": "تلميح: {hint}",
    "clinical.lab.reference": "النطاق المرجعي: {low}–{high} {unit}",
    "clinical.lab.note": "ملاحظة (اختياري)",
    "clinical.lab.notePlaceholder": "المختبر، حالة الصيام، الأعراض وقت السحب…",
    "clinical.lab.add": "إضافة نتيجة",
    "clinical.lab.history": "السجل",
    "clinical.lab.empty": "لا توجد نتائج مسجلة بعد. أضف أحدث تحاليلك أعلاه.",
    "clinical.lab.delete": "حذف النتيجة",
    "clinical.lab.disclaimer": "معلومات إرشادية فقط — راجع النتائج دائمًا مع طبيبك.",
    "clinical.lab.verdict.low": "منخفض",
    "clinical.lab.verdict.inRange": "ضمن النطاق",
    "clinical.lab.verdict.high": "مرتفع",
    "clinical.lab.tsh.label": "TSH",
    "clinical.lab.tsh.hint": "قيمة فحص الغدة الدرقية الأساسية.",
    "clinical.lab.ft4.label": "T4 الحر",
    "clinical.lab.ft4.hint": "هرمون الثيروكسين الحر.",
    "clinical.lab.vitaminD.label": "فيتامين د",
    "clinical.lab.vitaminD.hint": "25-هيدروكسي فيتامين د.",
    "clinical.lab.esr.label": "ESR",
    "clinical.lab.esr.hint": "سرعة ترسب الدم.",
    "clinical.lab.crp.label": "CRP",
    "clinical.lab.crp.hint": "البروتين المتفاعل C.",

    "toolkit.clinicalTitle": "المركز السريري",
    "toolkit.clinicalSubtitle": "تقييمات ذاتية ومتتبعات تساعدك على التحضير للمواعيد واستبعاد الحالات المتداخلة.",

    "sos.fab": "افتح مساعدة الأزمة",
    "sos.dismissFab": "إخفاء زر المساعدة",
    "sos.modal.title": "نجدة — دعم النوبة",
    "sos.modal.subtitle": "أنت لست وحدك. خطوة واحدة في كل مرة.",
    "sos.close": "إغلاق",
    "sos.breath.title": "عدّاد التنفس البطيء",
    "sos.breath.hint": "اتبع اسم المرحلة. الزفير الطويل يهدئ الجهاز العصبي.",
    "sos.breath.done": "أحسنت — تنفّسك أصبح أهدأ.",
    "sos.message.title": "أخبر شخصاً بما يحدث",
    "sos.message.body": "أعاني الآن من نوبة تليف عضلي غير متوقعة. قد أحتاج مساعدة في المهام اليومية أو مجاملة. لا داعي للذعر — أستريح وأتبع خطة النوبة الخاصة بي.",
    "sos.message.share": "مشاركة",
    "sos.message.copy": "نسخ",
    "sos.guide.title": "دوخة أو تشتت؟ افعل هذا الآن",
    "sos.guide.sit": "اجلس أو استلقِ فوراً — لا تكمل رغم كل شيء.",
    "sos.guide.head": "تحرّك ببطء. تحريك الرأس بسرعة يزيد الدوخة.",
    "sos.guide.sip": "اشرب الماء وتناول وجبة خفيفة مالحة إن توفرت.",
    "sos.guide.call": "إذا استمرت أكثر من 30 دقيقة أو ساءت — اتصل بشخص ما.",
    "sos.emergencyCall": "اتصل بالإسعاف",
    "sos.privacyNote": "لا شيء هنا يُرسل إلى خوادم FibroCare — المشاركة تحدث على جهازك فقط.",
    "spoon.checkin.title": "تسجيل الطاقة اليومي",
    "spoon.checkin.subtitle": "نظرية الملاعق — وزّع طاقتك كالمال.",
    "spoon.checkin.question": "كم ملعقة طاقة لديك اليوم؟",
    "spoon.checkin.guide.ask": "اختر رقم اليوم — سيشكّل بقية التطبيق حول طاقتك.",
    "spoon.checkin.guide.spend": "طاقة تكفي لما يهم. اختر شيئاً أو شيئين كبيرين وأجّل الباقي.",
    "spoon.checkin.guide.rest": "الراحة هي المهمة اليوم. كل شيء آخر يمكن انتظاره — هذا ليس فشلاً.",
    "spoon.checkin.mode.spend": "وضع توفير الطاقة: مغلق",
    "spoon.checkin.mode.rest": "وضع توفير الطاقة: مفعّل",
    "spoon.checkin.savedNote": "حُفظ في سجل طاقتك لليوم.",
    "spoon.checkin.saving": "جارٍ الحفظ…",
    "spoon.checkin.week": "آخر 7 أيام",
    "spoon.checkin.signInRequired": "يجب تسجيل الدخول أولاً.",
    "spoon.checkin.locked": "افتح قفل FibroCare لحفظ فحص الطاقة اليومي.",
    "spoon.checkin.invalid": "يجب أن تكون الملاعق بين 1 و 10.",
    "spoon.checkin.failed": "تعذر حفظ فحص الطاقة اليومي.",
    "pantry.title": "مساعد وجبات المؤن",
    "pantry.subtitle": "وجبات مضادة للالتهاب بنقرة واحدة لأيام الطاقة المنخفضة — 5 دقائق بلا قرارات.",
    "pantry.haveQuestion": "ما الموجود في مطبخك الآن؟",
    "pantry.loading": "جارٍ تحميل مؤنتك…",
    "pantry.noMatch": "اختر بعض المكونات أعلاه وستظهر الوجبات السريعة هنا.",
    "pantry.bestMatch": "أفضل تطابق — ابدأ هنا",
    "pantry.minutes": "{count} دقيقة",
    "pantry.disclaimer": "أفكار غذائية عامة وليست نصيحة طبية — اتبع خطة طبيبك.",
    "pantry.ing.oats": "شوفان",
    "pantry.ing.oliveOil": "زيت زيتون",
    "pantry.ing.fattyFish": "أسماك معلبة",
    "pantry.ing.leafyGreens": "خضار ورقية",
    "pantry.ing.berries": "توت",
    "pantry.ing.nuts": "مكسرات / بذور",
    "pantry.ing.yogurt": "زبادي",
    "pantry.ing.turmeric": "كركم",
    "pantry.ing.ginger": "زنجبيل",
    "pantry.ing.eggs": "بيض",
    "pantry.ing.bananas": "موز",
    "pantry.ing.wholeGrainBread": "خبز أسمر",
    "pantry.meal.oatBerryBowl": "وعاء شوفان بالتوت",
    "pantry.meal.oatBerryBowl.how": "انقع الشوفان في ماء أو حليب ساخن دقيقتين، أضف التوت وقليلًا من المكسرات. الكربوهيدرات البطيئة ومضادات الأكسدة تهدئ تيبّس الصباح.",
    "pantry.meal.turmericYogurtBowl": "وعاء الزبادي الذهبي",
    "pantry.meal.turmericYogurtBowl.how": "اخلط رشة كركم وقليلًا من العسل في الزبادي وأضف التوت. جرعة بروتين مضادة للالتهاب سريعة.",
    "pantry.meal.toastAvocadoSpinach": "توست أخضر",
    "pantry.meal.toastAvocadoSpinach.how": "حمّص الخبز وضع فوقه الخضار الورقية بخيط زيت زيتون ورشة ملح. المغنيسيوم في الخضار يخفف توتر العضلات.",
    "pantry.meal.sardineToast": "توست السردين",
    "pantry.meal.sardineToast.how": "اهرس السردين المعلب على التوست وضعه فوقه الخضار. أوميغا-3 أكثر الدهون المدعومة بالأدلة ضد الالتهاب.",
    "pantry.meal.gingerBananaSmoothie": "سموذي الزنجبيل والموز",
    "pantry.meal.gingerBananaSmoothie.how": "اخلط الموز والزبادي ولبّ الزنجبيل مع الماء أو الحليب. الزنجبيل يهدئ الغثيان المصاحب للنوبات.",
    "pantry.meal.eggGreenScramble": "بيض أخضر بدقيقتين",
    "pantry.meal.eggGreenScramble.how": "اخلط البيض في زيت الزيتون وأضف الخضار في النهاية. بروتين وخضار دون وقوف طويل في المطبخ.",
    "family.title": "بطاقات دعم العائلة",
    "family.subtitle": "شروح جاهزة لمن حولك — قلها مرة واحدة لا عشر مرات.",
    "family.shareTitle": "رسالة مني (FibroCare)",
    "family.copy": "نسخ",
    "family.copied": "تم النسخ!",
    "family.copyFailed": "فشل النسخ — حدد النص وانسخه يدوياً.",
    "family.share": "مشاركة",
    "family.privacyNote": "النسخ والمشاركة من جهازك فقط — خوادم FibroCare لا تراها أبداً.",
    "family.card.flare.title": "🔥 لديّ نوبة الآن",
    "family.card.flare.body": "تليفي العضلات مشتعل الآن: الألم والإرهاق قفا يرتفعان، وهذا ليس شيئاً يمكنني تجاهله. سأستريح — تسعدني شوربة أو توصيلة أو رسالة اطمئنان هادئة. لا داعي للزيارة أو المكالمات المتكررة. ستنتهي؛ تحتاج وقتاً فقط.",
    "family.card.fog.title": "🌫 نوبة ضباب دماغي",
    "family.card.fog.body": "تفكيري مشوش الآن (ضباب التليف): الكلمات تفلت، التركيز يتشتت، والقرارات تبدو ضخمة. هذا مؤقت وليس تفاهة مني. الرسائل القصيرة والبسيطة تساعد؛ لا تختبرني ولا تضف مهام الآن. سأعود حين يصفو.",
    "family.card.crash.title": "🔋 نفدت طاقتي اليوم",
    "family.card.crash.body": "استهلكت طاقة اليوم وجسدي يطلب راحة كاملة. إلغاء الخطط ليس استسلاماً — إنه حماية للغد. أرجو تدارك أي شيء عاجل بدلاً عني، ولنؤجل اللقاء حين تتعاش طاقتي.",
    "movement.title": "تذكيرات الحركة",
    "movement.off": "مغلق",
    "movement.minutes": "{count} دقيقة",
    "movement.popup.title": "وقت تمرين صغير",
    "movement.done": "تم — أحسنت",
    "movement.snooze": "غفوة 10 دقائق",
    "movement.dismiss": "تجاهل التذكير",
    "movement.stretch.neck": "أدر أذنك اليمنى ببطء نحو كتفك الأيمن؛ عدّ 4 أنفاس. بدّل الجانب.",
    "movement.stretch.shoulders": "دوّر كتفيك للخلف بدوائر بطيئة — 5 لفات مع زفير في كل نزولة.",
    "movement.stretch.wrists": "مدّ ذراعيك: دوّر معصميك 5 مرات لكل اتجاه، ثم انشر أصابعك وأغمضها.",
    "movement.stretch.hips": "وقوفاً أو جلوساً: انقل وزنك من جانب لآخر بلطف، 6 مرات بطيئة.",
    "movement.stretch.calves": "انتصب على أطراف أصابعك وانزل ببطء، 6 مرات — أيقظ الدورة الدموية دون إجهاد.",
    "support.title": "دعم الحياة اليومية",
    "support.subtitle": "شروح لمن حولك، وتذكيرات لطيفة تبقي عضلاتك رحيمة بك.",
    "summary.title": "ملخص جاهز للطبيب",
    "summary.subtitle": "صفحة واحدة نظيفة لموعدك القادم — لا مزيد من الاعتماد على الذاكرة أثناء الضباب.",
    "summary.loading": "جارٍ تجهيز ملخصك…",
    "summary.unavailable": "سيظهر ملخصك هنا عند تسجيل الدخول وفتح القفل.",
    "summary.heading": "ملخص التتبع الذاتي للتليف العضلي — {name}",
    "summary.line.period": "تم تتبع الأعراض في {count} يوماً من آخر {days} يوماً.",
    "summary.line.avgPain": "متوسط الألم {value}/10",
    "summary.line.peakPain": "الذروة {value}/10",
    "summary.line.flareDays": "{count} يوماً من النوبات (ألم ≥ 7/10)",
    "summary.line.cycleDays": "{count} يوماً لسجلات الدورة في الفترة",
    "summary.line.symptomAvg": "متوسط شدة الأعراض {value}/10",
    "summary.line.adherence": "تم تسجيل الأعراض في {count} يوماً من آخر 30 يوماً",
    "summary.line.meds": "الأدوية/المكملات الحالية: {meds}",
    "summary.line.medsNone": "لا قائمة أدوية محفوظة بعد — أضفها في المركز السريري قبل زيارتك.",
    "summary.generated": "أُنشئ في {date} · بيانات ذاتية من FibroCare",
    "summary.print": "طباعة / حفظ PDF",
    "summary.none": "غير متاح",
    "nav.clinical": "المركز السريري",
    "clinical.hub.title": "المركز السريري",
    "clinical.hub.subtitle": "تقييمات ومتتبعات وإرشادات علاجية وتقرير جاهز للطبيب — كل ما هو سريري في مكان واحد.",
    "clinical.hub.trackersTitle": "التقييمات والمتتبعات",
    "clinical.hub.trackersSubtitle": "تقييمات ذاتية منظمة وسجلات يومية تبني حقيبة موعدك الطبي.",
    "clinical.hub.lifestyleTitle": "العلاجي ونمط الحياة",
    "clinical.hub.lifestyleSubtitle": "إرشادات مبنية على الأدلة يمكنك تطبيقها اليوم: الحركة والنوم والتعامل مع النوبات.",
    "clinical.hub.reportTitle": "التقرير الأسبوعي / الشهري",
    "clinical.hub.reportSubtitle": "يجمع سجلاتك ومتتبعاتك وسياق الدورة في ملخص جاهز للنسخ لمشاركته مع طبيبك.",

    "clinical.exercise.title": "مكتبة التمارين منخفضة التأثير",
    "clinical.exercise.subtitle": "أدلة حركة لطيفة ومتدرجة. ابدأ بخفة وتقدم ببطء، ونظّم جهدك في كل جلسة.",
    "clinical.exercise.filter.all": "كل المستويات",
    "clinical.exercise.intensity.gentle": "لطيف",
    "clinical.exercise.intensity.light": "خفيف",
    "clinical.exercise.intensity.moderate": "متوسط",
    "clinical.exercise.minutes": "{count} دقيقة",
    "clinical.exercise.stepsLabel": "كيفية الأداء",
    "clinical.exercise.clearance": "استشر طبيبك قبل البدء",
    "clinical.exercise.tipsTitle": "مبادئ تنظيم الجهد",
    "clinical.exercise.tip.1": "ابدأ بنصف ما تعتقد أنه بإمكانك، ثم زد نحو 10% أسبوعيًا.",
    "clinical.exercise.tip.2": "توقف وأنت لا تزال لديك طاقة — الدفع حتى الإنهاك يكلفك أيامًا.",
    "clinical.exercise.tip.3": "نوبة قصيرة بعد نشاط جديد أمر شائع؛ أما الانهيار لأيام فيعني تقليل الجهد.",
    "clinical.exercise.tip.4": "الحركة اللطيفة اليومية أفضل من الجلسات الشديدة المتقطعة.",
    "clinical.exercise.walking.title": "المشي اللطيف",
    "clinical.exercise.walking.details": "القاعدة الهوائية الأيسر: مسارات مستوية وأحذية مريحة وسرعة تتيح لك الكلام أثناء المشي.",
    "clinical.exercise.walking.steps": "1. اختر حلقة مستوية وظليلة قرب منزلك.\n2. امشِ 3–5 دقائق ثم استرح أو ارجع.\n3. أضف 1–2 دقيقة فقط في الأيام التي تشعر فيها باستقرار.\n4. راقب شعورك صباح اليوم التالي قبل الإطالة.",
    "clinical.exercise.water.title": "تمارين الماء الدافئ",
    "clinical.exercise.water.details": "الطفو يخفف الحمل عن المفاصل المؤلمة بينما توفر المقاومة اللطيفة قوة — أفضل التمارين تحملاً في دراسات الليفوميالجيا.",
    "clinical.exercise.water.steps": "1. اختر مسبحًا دافئًا (32–34°م إن أمكن).\n2. امشِ في الحافة الضحلة لمدة 5 دقائق.\n3. أضف تأرجح الساقين ودوائر الكتفين ببطء.\n4. توقف قبل أن تشعر بالبرد أو التعب.",
    "clinical.exercise.taiChi.title": "التاي تشي",
    "clinical.exercise.taiChi.details": "حركات بطيئة متدفقة تدرب التوازن وتلين التنفس؛ أدلة تجريبية قوية على تخفيف أعراض الليفوميالجيا.",
    "clinical.exercise.taiChi.steps": "1. ابدأ بحركة الإحماء الافتتاحية فقط.\n2. اتبع فيديو مبتدئ أو صفًا بنصف السرعة.\n3. أبقِ الركبتين مرنتين — لا مقفلتين أبدًا.\n4. تدرّب 10–20 دقيقة، 2–3 مرات أسبوعيًا.",
    "clinical.exercise.yoga.title": "اليوغا اللطيفة",
    "clinical.exercise.yoga.details": "وضعيات استعادية مع وسائل دعم ومسكات طويلة؛ ركّز على التنفس والراحة لا على عمق التمدد.",
    "clinical.exercise.yoga.steps": "1. استخدم كرسيًا أو حائطًا للدعم في كل وضعية وقوف.\n2. امسك الوضعية 30–60 ثانية دون إجهاد.\n3. فضّل الوضعيات الاستعادية: وضعية الطفل، الرجلان على الحائط.\n4. تجنب اليوغا الساخنة والتدفقات السريعة.",
    "clinical.exercise.stretching.title": "التمدد اليومي",
    "clinical.exercise.stretching.details": "روتين 10 دقائق لكل الجسم يبقي تيبّس الصباح محتملًا — أكثر عادة تخفيفٍ شيوعًا بين المرضى.",
    "clinical.exercise.stretching.steps": "1. تمدد بعد دش دافئ عندما تكون العضلات دافئة.\n2. امسك كل تمدد 20–30 ثانية؛ لا ترتد أبدًا.\n3. تنفس ببطء وأخرج النفس داخل التمدد.\n4. غطِّ الرقبة والكتفين والظهر والوركين والسمانة.",
    "clinical.exercise.strength.title": "تمارين قوة خفيفة",
    "clinical.exercise.strength.details": "المقاومة الخفيفة تحمي العضلات والعظام. ابدأ فقط عندما تصبح أنشطتك اليومية مُدارَة، ويفضل مع أخصائي علاج طبيعي.",
    "clinical.exercise.strength.steps": "1. ابدأ بأحزمة المقاومة أو أوزان 0.5–1 كغ.\n2. 8–12 تكرارًا بطيئًا لكل تمرين، مجموعة واحدة.\n3. استرح 48 ساعة بين جلسات القوة.\n4. قلل الوزن إذا زاد الألم في اليوم التالي.",
    "clinical.exercise.cycling.title": "الدراجة الثابتة",
    "clinical.exercise.cycling.details": "جهد هوائي مستقل عن الطقس وبدون ارتطام — المقعد يحمل وزنك لا مفاصلك.",
    "clinical.exercise.cycling.steps": "1. اضبط ارتفاع المقعد مريحًا (انثناء بسيط في الركبة).\n2. ابدأ بـ5 دقائق دون مقاومة.\n3. أضف 1–2 دقيقة لكل جلسة، والمقاومة أخيرًا.\n4. حافظ على إيقاع بطيء وثابت.",
    "clinical.exercise.seatedBand.title": "روتين الحزام جالسًا",
    "clinical.exercise.seatedBand.details": "جلسة كاملة للجزء العلوي من على الكرسي — لأيام النوبات وأيام الطاقة المنخفضة وفترات الراحة في العمل.",
    "clinical.exercise.seatedBand.steps": "1. اجلس معتدلًا والقدمان مستويتين، والحزام ملوف حول اليدين.\n2. السحب: اسحب الحزام نحو صدرك والمرفقان للخلف.\n3. الدفع: مِد الذراعين أمامك على مستوى الصدر.\n4. 8–10 تكرارات بطيئة لكل حركة مع راحة عند الحاجة.",

    "clinical.sleep.title": "إرشادات نظافة النوم",
    "clinical.sleep.subtitle": "النوم غير المجدّ يضخّم الألم وضباب الليفو. هذه العادات تستهدف العوامل الأهم فعليًا.",
    "clinical.sleep.checklistTitle": "قائمة الليلة",
    "clinical.sleep.score": "{count} من 8 عادات",
    "clinical.sleep.reading.strong": "روتين قوي",
    "clinical.sleep.reading.building": "قيد البناء",
    "clinical.sleep.reading.starting": "بداية فقط",
    "clinical.sleep.hint.strong": "واصل — الاستمرارية هي ما يحمي نومك.",
    "clinical.sleep.hint.building": "اختر عادة إضافية وكررها كل ليلة لأسبوع.",
    "clinical.sleep.hint.starting": "ابدأ بموعد استيقاظ ثابت — فهو يضبط كل ما عداها.",
    "clinical.sleep.disclaimer": "إذا استمر الأرق رغم النوم الجيد، ناقش الأمر مع طبيبك — حالات قابلة للعلاج مثل متلازمة تململ الساقين وانقطاع النفس النومي شائعة مع الليفوميالجيا.",
    "clinical.sleep.consistentSchedule.title": "مواعيد ثابتة",
    "clinical.sleep.consistentSchedule.body": "موعد استيقاظ واحد كل يوم — حتى بعد ليلة سيئة وفي عطلات نهاية الأسبوع.",
    "clinical.sleep.darkCoolRoom.title": "غرفة مظلمة وباردة",
    "clinical.sleep.darkCoolRoom.body": "أمعم الغرفة وأبقها باردة قليلًا؛ حرارة الليل تزيد ألم الليفو.",
    "clinical.sleep.screenWindDown.title": "تهدئة الشاشات",
    "clinical.sleep.screenWindDown.body": "اترك الشاشات قبل النوم بـ60–90 دقيقة؛ خفّف الإضاءة وانتقل إلى شيء هادئ.",
    "clinical.sleep.caffeineCutoff.title": "حد الكافيين",
    "clinical.sleep.caffeineCutoff.body": "لا كافيين بعد بعد الظهر — يبقى في الجسم أكثر من 8 ساعات ويفسد النوم العميق.",
    "clinical.sleep.eveningRoutine.title": "روتين المساء",
    "clinical.sleep.eveningRoutine.body": "تهدئة ثابتة 20–30 دقيقة — دش دافئ، تمدد خفيف، شاي أعشاب — تُعلن للجسم اقتراب النوم.",
    "clinical.sleep.preSleepRelaxation.title": "استرخاء في السرير",
    "clinical.sleep.preSleepRelaxation.body": "تنفس بطيء أو مسح للجسم أثناء الاستلقاء؛ إذا بقيت مستيقظًا نحو 20 دقيقة فانهض وأعد الضبط.",
    "clinical.sleep.gentleDaylight.title": "ضوء الصباح",
    "clinical.sleep.gentleDaylight.body": "10–20 دقيقة من ضوء النهار مبكرًا تقوي إيقاع النوم واليقظة لديك.",
    "clinical.sleep.painComfortPrep.title": "تجهيز راحة الألم",
    "clinical.sleep.painComfortPrep.body": "جهّز وسائد الدعم وسادة التدفئة ومسكناتك قبل النوم حتى لا يخرب الألم ليلك.",

    "clinical.coping.title": "أدوات إدارة النوبات والتعافي",
    "clinical.coping.subtitle": "لحظات النوبة: استراتيجيات تبدأ بها فورًا، مع تمرين تنفس موجّه.",
    "clinical.coping.pacing.title": "تنظيم الجهد والراحة",
    "clinical.coping.pacing.body": "خفّف النشاط بدل إيقافه تمامًا؛ بدّل بين 15–20 دقيقة جهد لطيف وراحة حقيقية.",
    "clinical.coping.pacing.action": "جرّب: اضبط مؤقتًا لـ15 دقيقة راحة قبل مهمتك التالية.",
    "clinical.coping.breathing.title": "التنفس البطيء",
    "clinical.coping.breathing.body": "الزفير الطويل البطيء يهدئ الجهاز العصبي ويخفف حدّة ارتفاعات الألم.",
    "clinical.coping.breathing.action": "جرّب: ابدأ تمرين 4-7-8 الموجّه أدناه.",
    "clinical.coping.grounding.title": "التهدئة 5-4-3-2-1",
    "clinical.coping.grounding.body": "رتّب نفسك في الحاضر حين تجلب النوبة ذعرًا: سمِّ 5 أشياء تراها، و4 تشعر بها باللمس، و3 تسمعها، و2 تشمها، و1 تتذوقه.",
    "clinical.coping.grounding.action": "جرّب: ببطء — حاسة واحدة في المرة تكفي.",
    "clinical.coping.heatComfort.title": "الدفء اللطيف",
    "clinical.coping.heatComfort.body": "كمادة دافئة أو بطانية تدفئة أو حمام دافئ يريح العضلات المتوترة ويخفف الألم العميق.",
    "clinical.coping.heatComfort.action": "جرّب: 15–20 دقيقة دفء على المنطقة الأكثر ألمًا.",
    "clinical.coping.sensoryShutdown.title": "إغلاق حسي",
    "clinical.coping.sensoryShutdown.body": "في لحظات الحمل الحسي الزائد، أخفف الإضاءة وأسكت التنبيهات واعتزل مكانًا هادئًا دقائق.",
    "clinical.coping.sensoryShutdown.action": "جرّب: سماعات + غرفة معتمة + أنفاس بطيئة، 10 دقائق.",
    "clinical.coping.support.title": "اطلب الدعم",
    "clinical.coping.support.body": "أخبر شخصًا واحدًا بشعورك — شريكك أو صديقًا أو عبر رابط المشاركة للمقدّم على الرعاية. الدعم يخفف ضيق النوبة.",
    "clinical.coping.support.action": "جرّب: أرسل رسالة قصيرة واحدة — دون شرح مطوّل.",
    "clinical.coping.breath.title": "تنفس 4-7-8 الموجّه",
    "clinical.coping.breath.subtitle": "شهيق 4 ثوانٍ · حبس 7 ثوانٍ · زفير 8 ثوانٍ. أربع دورات هدف أول جيد.",
    "clinical.coping.breath.start": "ابدأ",
    "clinical.coping.breath.pause": "إيقاف مؤقت",
    "clinical.coping.breath.reset": "إعادة",
    "clinical.coping.breath.inhale": "شهيق",
    "clinical.coping.breath.hold": "حبس",
    "clinical.coping.breath.exhale": "زفير",
    "clinical.coping.breath.cycleCount": "الدورات: {count}",
    "clinical.coping.breath.aria": "مؤقت التنفس الموجّه",
    "clinical.coping.disclaimer": "إذا بدت النوبة مختلفة عن نمطك المعتاد — ضعف جديد أو ألم صدر أو أعراض بجانب واحد — اطلب الرعاية الطبية فورًا.",

    "clinical.report.title": "التقرير الأسبوعي / الشهري",
    "clinical.report.subtitle": "ملخص جاهز للطبيب لسجلاتك ومحفزاتك وتحاليلك وسياق الدورة للفترة المختارة.",
    "clinical.report.period.week": "هذا الأسبوع",
    "clinical.report.period.month": "هذا الشهر",
    "clinical.report.stat.avgPain": "متوسط الألم",
    "clinical.report.stat.peakPain": "أقصى ألم",
    "clinical.report.stat.flareDays": "أيام النوبة (≥7/10)",
    "clinical.report.stat.adherence": "الالتزام بالتسجيل",
    "clinical.report.trigger.title": "محفزات النوبة في هذه الفترة",
    "clinical.report.trigger.none": "لا محفزات نوبة مسجلة في هذه الفترة.",
    "clinical.report.trigger.top": "أبرز محفز: {factor} (متوسط {avg}/10 عبر {count} نوبة)",
    "clinical.report.lab.title": "أبرز نتائج المختبر",
    "clinical.report.lab.none": "لا نتائج مختبر في هذه الفترة.",
    "clinical.report.meds.title": "الأدوية المجدولة",
    "clinical.report.meds.none": "لا أدوية مجدولة بعد.",
    "clinical.report.acr.title": "فرز ACR 2010/2016",
    "clinical.report.acr.met": "المعايير مستوفاة (WPI {wpi}/19 · SS {ss}/12)",
    "clinical.report.acr.notMet": "المعايير غير مستوفاة (WPI {wpi}/19 · SS {ss}/12)",
    "clinical.report.acr.none": "لا يوجد تقييم ACR محفوظ بعد.",
    "clinical.report.cycle.title": "سياق الدورة",
    "clinical.report.cycle.none": "لا بيانات دورة في هذه الفترة.",
    "clinical.report.empty": "لا سجلات أعراض في هذه الفترة بعد — واصل التسجيل لبناء التقرير.",
    "clinical.report.copy": "نسخ للطبيب",
    "clinical.report.copied": "تم النسخ ✓",
    "clinical.report.shareHint": "الصقه في رسالة أو اطبعه للموعد.",

    "caregiver.badge": "عرض مقدم الرعاية",
    "caregiver.title": "توقع النوبة لـ {name}",
    "caregiver.readOnly": "مشاركة للاطلاع فقط — لا تظهر هنا أي يوميات أو درجات أو بيانات.",
    "caregiver.level.high": "مرتفع",
    "caregiver.level.moderate": "متوسط",
    "caregiver.level.low": "هادئ",
    "caregiver.daysToPeriod": "أيام حتى الدورة القادمة",
    "caregiver.cyclePhase": "طور الدورة",
    "caregiver.unknown": "غير معروف",
    "caregiver.insight": "خطط لدعم لطيف حول النافذة المرتفعة: حافظ على تذكيرات الراحة قريبة، والوجبات دافئة وثابتة، والنزهات قصيرة. يشارك هذا الرابط توقع اليوم فقط — ويتحدث تلقائيًا.",
    "caregiver.linkInactive": "رابط المشاركة هذا غير نشط.",

    "doctor.filter.searchLabel": "ابحث في الملف",
    "doctor.filter.searchPlaceholder": "ابحث في العنوان أو النص أو اسم الكاتب…",
    "doctor.filter.topic": "الموضوع",
    "doctor.filter.topicAll": "كل المواضيع",
    "doctor.filter.topics.pain": "الألم والنوبات",
    "doctor.filter.topics.sleep": "النوم",
    "doctor.filter.topics.fatigue": "التعب والطاقة",
    "doctor.filter.topics.medication": "الأدوية",
    "doctor.filter.topics.nutrition": "التغذية",
    "doctor.filter.topics.mentalHealth": "الصحة النفسية",
    "doctor.filter.topics.research": "بحث علمي",
    "doctor.filter.topics.lifestyle": "نمط الحياة",
    "doctor.filter.specialization": "التخصص",
    "doctor.filter.specAll": "كل التخصصات",
    "doctor.filter.spec.rheumatology": "الأمراض الروماتيزمية",
    "doctor.filter.spec.neurology": "الأعصاب",
    "doctor.filter.spec.painMedicine": "طب الألم",
    "doctor.filter.spec.physiatry": "الطب الطبيعي والتأهيل",
    "doctor.filter.spec.physiotherapy": "العلاج الطبيعي",
    "doctor.filter.spec.psychology": "علم النفس",
    "doctor.filter.spec.generalMedicine": "الطب العام",
    "doctor.filter.clear": "مسح الفلاتر",
    "doctor.filter.showing": "{shown} من {total} منشورًا",
    "doctor.filter.noResults": "لا منشورات تطابق هذه الفلاتر. جرّب مسحها.",
  },
};